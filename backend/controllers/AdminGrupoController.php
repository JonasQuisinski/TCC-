<?php
// Controller para administração global de grupos (apenas administradores do sistema)
require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../api/session_utils.php';
header('Content-Type: application/json');

start_secure_session();
require_login_json();

// Verificar flag is_admin no banco para o usuário logado
$usuarioId = $_SESSION['usuario_id'] ?? null;
if (!$usuarioId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

try {
    $stmtAdmin = $pdo->prepare("SELECT is_admin FROM usuarios WHERE id = ?");
    $stmtAdmin->execute([$usuarioId]);
    $rowAdmin = $stmtAdmin->fetch();
    if (!$rowAdmin || empty($rowAdmin['is_admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Acesso negado: apenas administradores podem usar esta função']);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao verificar administrador']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? null;
try {
    switch ($action) {
        case 'list_groups':
            // listar grupos e contar membros usando usuarios.grupo_id (modelo simplificado)
            $stmt = $pdo->query("SELECT g.grupo_id AS id, g.grupo_id, g.nome, g.descricao, g.owner_id, g.created_at, IFNULL((SELECT COUNT(*) FROM usuarios u WHERE u.grupo_id = g.grupo_id),0) as membros FROM grupos g ORDER BY g.created_at DESC");
            $rows = $stmt->fetchAll();
            echo json_encode(['success' => true, 'groups' => $rows]);
            break;

        case 'get_group':
            $id = $_GET['grupo_id'] ?? null;
            if (!$id) throw new Exception('grupo_id é obrigatório');
            $stmt = $pdo->prepare("SELECT g.grupo_id AS id, g.grupo_id, g.nome, g.descricao, g.owner_id, g.created_at FROM grupos g WHERE g.grupo_id = ?"); $stmt->execute([$id]); $g = $stmt->fetch();
            // MODELO SIMPLIFICADO: usuarios têm coluna grupo_id
            $stmt2 = $pdo->prepare("SELECT id, nome, email, grupo_id FROM usuarios WHERE grupo_id = ?"); $stmt2->execute([$id]); $members = $stmt2->fetchAll();
            echo json_encode(['success' => true, 'group' => $g, 'members'=>$members]);
            break;

        case 'create':
            $input = json_decode(file_get_contents('php://input'), true);
            $nome = trim($input['nome'] ?? '');
            $descricao = trim($input['descricao'] ?? '');
            $ownerId = $input['owner_id'] ?? $_SESSION['usuario_id'];
            if ($nome === '') throw new Exception('Nome é obrigatório');
            $stmt = $pdo->prepare("INSERT INTO grupos (nome, descricao, owner_id, created_at) VALUES (?, ?, ?, NOW())");
            $stmt->execute([$nome, $descricao, $ownerId]);
            $gid = $pdo->lastInsertId();
            // associar o owner ao grupo via usuarios.grupo_id
            $stmt2 = $pdo->prepare("UPDATE usuarios SET grupo_id = ? WHERE id = ?"); $stmt2->execute([$gid, $ownerId]);
            echo json_encode(['success'=>true,'grupo_id'=>$gid,'id'=>(int)$gid]);
            break;

        case 'edit':
            $input = json_decode(file_get_contents('php://input'), true);
            $grupoId = $input['grupo_id'] ?? null; $nome = trim($input['nome'] ?? ''); $descricao = trim($input['descricao'] ?? '');
            if (!$grupoId) throw new Exception('grupo_id obrigatório');
            $stmt = $pdo->prepare("UPDATE grupos SET nome = ?, descricao = ? WHERE grupo_id = ?"); $stmt->execute([$nome, $descricao, $grupoId]);
            echo json_encode(['success'=>true]);
            break;

        case 'add_user':
            // MODELO SIMPLIFICADO: associar usuário ao grupo definindo usuarios.grupo_id
            $input = json_decode(file_get_contents('php://input'), true);
            $grupoId = $input['grupo_id'] ?? null; $email = trim($input['email'] ?? '');
            if (!$grupoId || !$email) throw new Exception('grupo_id e email obrigatórios');
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?"); $stmt->execute([$email]); $u = $stmt->fetch();
            if (!$u) throw new Exception('Usuário não encontrado');
            $uid = $u['id'];
            $stmtUpd = $pdo->prepare("UPDATE usuarios SET grupo_id = ? WHERE id = ?");
            $stmtUpd->execute([$grupoId, $uid]);
            echo json_encode(['success'=>true]);
            break;

        case 'remove_user':
            // MODELO SIMPLIFICADO: desassociar usuário do grupo (set NULL)
            $input = json_decode(file_get_contents('php://input'), true);
            $grupoId = $input['grupo_id'] ?? null; $usuarioId = $input['usuario_id'] ?? null;
            if (!$grupoId || !$usuarioId) throw new Exception('grupo_id e usuario_id obrigatórios');
            $stmt = $pdo->prepare("UPDATE usuarios SET grupo_id = NULL WHERE id = ? AND grupo_id = ?"); $stmt->execute([$usuarioId, $grupoId]);
            echo json_encode(['success'=>true]);
            break;

        default:
            echo json_encode(['success'=>false,'message'=>'Ação inválida']);
            break;
    }
} catch (PDOException $e) {
    error_log('AdminGrupoController PDO: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Erro interno']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}

?>
