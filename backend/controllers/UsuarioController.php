<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
require_once '../api/session_utils.php';

// Inicializar sessao de forma segura
$ok = start_secure_session();
if ($ok === false) {
    http_response_code(401);
    echo json_encode(['erro' => 'Sessao expirada']);
    exit;
}

// Verificar se usuario esta logado
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Usuario nao autenticado']);
    exit;
}

$acao = $_GET['action'] ?? '';
$usuario_id = $_SESSION['usuario_id'];

switch ($acao) {
    
    case 'obter_perfil':
        // Retorna dados do perfil do usuario logado
        $stmt = $pdo->prepare("
            SELECT id, nome, email, data_nascimento, status, grupo_id, is_admin, created_at
            FROM usuarios
            WHERE id = ?
        ");
        $stmt->execute([$usuario_id]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($usuario) {
            echo json_encode([
                'sucesso' => true,
                'usuario' => $usuario
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['erro' => 'Usuario nao encontrado']);
        }
        break;

    case 'atualizar_perfil':
        // Atualiza dados do perfil (sem logout)
        $data = json_decode(file_get_contents('php://input'), true);
        
        $nome = $data['nome'] ?? null;
        $data_nascimento = $data['data_nascimento'] ?? null;
        $email = $data['email'] ?? null;
        
        if (!$nome || !$email) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome e email sao obrigatorios']);
            exit;
        }
        
        // Verificar se novo email ja existe
        if ($email !== $_SESSION['usuario_email']) {
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
            $stmt->execute([$email, $usuario_id]);
            if ($stmt->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(['erro' => 'Este email ja esta cadastrado']);
                exit;
            }
        }
        
        // Construir query dinamicamente
        $campos = [];
        $valores = [];
        
        if ($nome !== null) {
            $campos[] = "nome = ?";
            $valores[] = $nome;
        }
        
        if ($email !== null) {
            $campos[] = "email = ?";
            $valores[] = $email;
        }
        
        if ($data_nascimento !== null && $data_nascimento !== '') {
            $campos[] = "data_nascimento = ?";
            $valores[] = $data_nascimento;
        }
        
        if (empty($campos)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nenhum campo para atualizar']);
            exit;
        }
        
        $valores[] = $usuario_id;
        
        // Atualizar banco
        $sql = "UPDATE usuarios SET " . implode(", ", $campos) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        
        try {
            $resultado = $stmt->execute($valores);
            
            if ($resultado) {
                // IMPORTANTE: Atualizar $_SESSION com novos dados ANTES de retornar
                if ($nome !== null) {
                    $_SESSION['usuario_nome'] = $nome;
                }
                if ($email !== null) {
                    $_SESSION['usuario_email'] = $email;
                }
                
                // Retornar com success
                http_response_code(200);
                echo json_encode([
                    'sucesso' => true,
                    'mensagem' => 'Perfil atualizado com sucesso',
                    'usuario' => [
                        'id' => $usuario_id,
                        'nome' => $_SESSION['usuario_nome'],
                        'email' => $_SESSION['usuario_email'],
                        'data_nascimento' => $data_nascimento
                    ]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['erro' => 'Erro ao atualizar perfil no banco de dados']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro: ' . $e->getMessage()]);
        }
        break;

    case 'alterar_senha':
        // Altera senha do usuario
        $data = json_decode(file_get_contents('php://input'), true);
        
        $senha_atual = $data['senha_atual'] ?? null;
        $senha_nova = $data['senha_nova'] ?? null;
        $senha_confirmar = $data['senha_confirmar'] ?? null;
        
        if (!$senha_atual || !$senha_nova || !$senha_confirmar) {
            http_response_code(400);
            echo json_encode(['erro' => 'Todos os campos de senha sao obrigatorios']);
            exit;
        }
        
        if ($senha_nova !== $senha_confirmar) {
            http_response_code(400);
            echo json_encode(['erro' => 'As senhas nao correspondem']);
            exit;
        }
        
        if (strlen($senha_nova) < 6) {
            http_response_code(400);
            echo json_encode(['erro' => 'Senha deve ter pelo menos 6 caracteres']);
            exit;
        }
        
        // Buscar usuario e verificar senha atual
        $stmt = $pdo->prepare("SELECT senha FROM usuarios WHERE id = ?");
        $stmt->execute([$usuario_id]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$usuario || !password_verify($senha_atual, $usuario['senha'])) {
            http_response_code(401);
            echo json_encode(['erro' => 'Senha atual incorreta']);
            exit;
        }
        
        // Atualizar senha
        $senha_hash = password_hash($senha_nova, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET senha = ? WHERE id = ?");
        
        if ($stmt->execute([$senha_hash, $usuario_id])) {
            echo json_encode([
                'sucesso' => true,
                'mensagem' => 'Senha alterada com sucesso'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao alterar senha']);
        }
        break;

    case 'listar_usuarios':
        // Admin: Listar todos os usuarios
        if (!($_SESSION['is_admin'] ?? false)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Acesso negado']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            SELECT id, nome, email, data_nascimento, status, grupo_id, is_admin, created_at
            FROM usuarios
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        
        echo json_encode([
            'sucesso' => true,
            'usuarios' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
        break;

    case 'obter_usuario':
        // Admin: Obter um usuario especifico
        if (!($_SESSION['is_admin'] ?? false)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Acesso negado']);
            exit;
        }
        
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do usuario e obrigatorio']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            SELECT id, nome, email, data_nascimento, status, grupo_id, is_admin, created_at
            FROM usuarios
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($usuario) {
            echo json_encode([
                'sucesso' => true,
                'usuario' => $usuario
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['erro' => 'Usuario nao encontrado']);
        }
        break;

    case 'atualizar_usuario':
        // Admin: Atualizar um usuario
        if (!($_SESSION['is_admin'] ?? false)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Acesso negado']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do usuario e obrigatorio']);
            exit;
        }
        
        $campos_atualizacao = [];
        $valores = [];
        
        if (isset($data['nome'])) {
            $campos_atualizacao[] = "nome = ?";
            $valores[] = $data['nome'];
        }
        
        if (isset($data['email'])) {
            // Verificar email duplicado
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
            $stmt->execute([$data['email'], $id]);
            if ($stmt->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(['erro' => 'Este email ja esta cadastrado']);
                exit;
            }
            $campos_atualizacao[] = "email = ?";
            $valores[] = $data['email'];
        }
        
        if (isset($data['data_nascimento'])) {
            $campos_atualizacao[] = "data_nascimento = ?";
            $valores[] = $data['data_nascimento'];
        }
        
        if (isset($data['status'])) {
            $campos_atualizacao[] = "status = ?";
            $valores[] = (int)$data['status'];
        }
        
        if (isset($data['is_admin'])) {
            $campos_atualizacao[] = "is_admin = ?";
            $valores[] = (int)$data['is_admin'];
        }
        
        if (isset($data['grupo_id'])) {
            $campos_atualizacao[] = "grupo_id = ?";
            $valores[] = $data['grupo_id'] === null ? null : (int)$data['grupo_id'];
        }
        
        if (empty($campos_atualizacao)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nenhum campo para atualizar']);
            exit;
        }
        
        $valores[] = $id;
        
        $sql = "UPDATE usuarios SET " . implode(", ", $campos_atualizacao) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        
        if ($stmt->execute($valores)) {
            echo json_encode([
                'sucesso' => true,
                'mensagem' => 'Usuario atualizado com sucesso'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar usuario']);
        }
        break;

    case 'deletar_usuario':
        // Admin: Deletar um usuario
        if (!($_SESSION['is_admin'] ?? false)) {
            http_response_code(403);
            echo json_encode(['erro' => 'Acesso negado']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do usuario e obrigatorio']);
            exit;
        }
        
        // Nao permitir deletar a si mesmo
        if ($id == $usuario_id) {
            http_response_code(400);
            echo json_encode(['erro' => 'Voce nao pode deletar sua propria conta']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
        
        if ($stmt->execute([$id])) {
            echo json_encode([
                'sucesso' => true,
                'mensagem' => 'Usuario deletado com sucesso'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao deletar usuario']);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['erro' => 'Acao invalida']);
}
?>
