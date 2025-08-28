<?php
// login.php - Sistema de login seguro com hash

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Tratar requisições OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../../backend/config/conexao.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }

    // Ler dados JSON do corpo da requisição
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validar se dados foram recebidos
    if (!$data) {
        throw new Exception('Dados inválidos recebidos');
    }

    // Extrair dados
    $email = trim($data['email'] ?? '');
    $senha = $data['senha'] ?? '';
    $lembrarMe = $data['lembrar_me'] ?? false;

    // Validações
    if (empty($email)) {
        throw new Exception('E-mail é obrigatório');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('E-mail inválido');
    }

    if (empty($senha)) {
        throw new Exception('Senha é obrigatória');
    }

    // Buscar usuário
    $stmt = $pdo->prepare("SELECT id, nome, email, senha, status, created_at FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch();

    // Verificar se usuário existe e senha está correta
    if (!$usuario || !password_verify($senha, $usuario['senha'])) {
        // Log de tentativa de login inválida
        error_log("Tentativa de login inválida para: $email em " . date('Y-m-d H:i:s'));
        
        //  delay 
        sleep(1);
        
        throw new Exception('E-mail ou senha incorretos');
    }

    // Verificar se conta está ativa (se usar status)
    /*
    if ($usuario['status'] === 'inativo') {
        throw new Exception('Conta inativa. Entre em contato com o administrador');
    }
    */

    //criar sessão
    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['usuario_nome'] = $usuario['nome'];
    $_SESSION['usuario_email'] = $usuario['email'];
    $_SESSION['login_time'] = time();

    error_log("Login bem-sucedido: {$usuario['email']} em " . date('Y-m-d H:i:s'));

   //implementar depois
    // try {
    //     $updateStmt = $pdo->prepare("UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?");
    //     $updateStmt->execute([$usuario['id']]);
    // } catch (PDOException $e) {
    //     error_log("Aviso: Não foi possível atualizar último login: " . $e->getMessage());
    // }

    //  sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Login realizado com sucesso',
        'user' => [
            'id' => $usuario['id'],
            'nome' => $usuario['nome'],
            'email' => $usuario['email']
        ],
        'redirect' => '../../painel/painel.html'
    ]);

} catch (PDOException $e) {
    // Erro de banco
    error_log("Erro de banco no login: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);

} catch (Exception $e) {
    // Outros erros 
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>