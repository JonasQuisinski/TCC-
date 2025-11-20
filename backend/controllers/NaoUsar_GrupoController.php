<?php
// backend/controllers/GrupoController.php
// Controller simples para gerenciamento de grupos e convites

require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../api/session_utils.php';
header('Content-Type: application/json');

// iniciar sessão segura
start_secure_session();
// exigir login para a maioria das ações
$action = $_GET['action'] ?? $_POST['action'] ?? null;

try {
    if (in_array($action, ['list_mine','create','invite','list_members','remove_member'])) {
        require_login_json();
    }

    switch ($action) {
        case 'list_mine':
            // Retorna os grupos relacionados ao usuário: grupos que ele é owner ou o grupo onde seu registro aponta (usuarios.grupo_id)
            $usuarioId = $_SESSION['usuario_id'];
            // tenta obter o grupo_id do usuário (pode ser NULL)
            $stmt = $pdo->prepare("SELECT grupo_id FROM usuarios WHERE id = ?");
            $stmt->execute([$usuarioId]);
            $row = $stmt->fetch();
            $userGrupoId = $row ? $row['grupo_id'] : null;

            if ($userGrupoId) {
                $stmt = $pdo->prepare("SELECT g.grupo_id AS id, g.grupo_id, g.nome, g.descricao, g.owner_id, g.created_at FROM grupos g WHERE g.owner_id = ? OR g.grupo_id = ? ORDER BY g.created_at DESC");
                $stmt->execute([$usuarioId, $userGrupoId]);
            } else {
                // usuário não faz parte de nenhum grupo, retorna apenas os que ele é owner
                $stmt = $pdo->prepare("SELECT g.grupo_id AS id, g.grupo_id, g.nome, g.descricao, g.owner_id, g.created_at FROM grupos g WHERE g.owner_id = ? ORDER BY g.created_at DESC");
                $stmt->execute([$usuarioId]);
            }

            $grupos = $stmt->fetchAll();
            echo json_encode(['success' => true, 'grupos' => $grupos]);
            break;

        case 'create':
            $input = json_decode(file_get_contents('php://input'), true);
            $nome = trim($input['nome'] ?? '');
            $descricao = trim($input['descricao'] ?? '');
            if ($nome === '') throw new Exception('Nome do grupo é obrigatório');
            $owner = $_SESSION['usuario_id'];
            $stmt = $pdo->prepare("INSERT INTO grupos (nome, descricao, owner_id, created_at) VALUES (?, ?, ?, NOW())");
            $stmt->execute([$nome, $descricao, $owner]);
            $grupoId = $pdo->lastInsertId();
            // se o modelo usa usuarios.grupo_id, associar o owner ao grupo
            $stmt2 = $pdo->prepare("UPDATE usuarios SET grupo_id = ? WHERE id = ?");
            $stmt2->execute([$grupoId, $owner]);
            echo json_encode(['success' => true, 'grupo_id' => $grupoId, 'id' => (int)$grupoId]);
            break;

        case 'list_members':
            $grupoId = $_GET['grupo_id'] ?? null;
            if (!$grupoId) throw new Exception('grupo_id é obrigatório');
            // lista usuários cujo usuarios.grupo_id é o grupo em questão
            $stmt = $pdo->prepare("SELECT u.id, u.nome, u.email, u.is_admin, u.created_at FROM usuarios u WHERE u.grupo_id = ?");
            $stmt->execute([$grupoId]);
            $members = $stmt->fetchAll();
            echo json_encode(['success' => true, 'members' => $members]);
            break;

        case 'invite':
            // Body JSON: { grupo_id, email }
            $input = json_decode(file_get_contents('php://input'), true);
            $grupoId = $input['grupo_id'] ?? null;
            $email = trim($input['email'] ?? '');
            if (!$grupoId) throw new Exception('grupo_id é obrigatório');
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception('E-mail inválido');

            // gerar token
            $token = bin2hex(random_bytes(16));
            $invitedBy = $_SESSION['usuario_id'];
            $expires = date('Y-m-d H:i:s', strtotime('+7 days'));

            $stmt = $pdo->prepare("INSERT INTO grupo_convites (grupo_id, email, token, invited_by, status, created_at, expires_at) VALUES (?, ?, ?, ?, 'pending', NOW(), ?)");
            $stmt->execute([$grupoId, $email, $token, $invitedBy, $expires]);
            $inviteId = $pdo->lastInsertId();

            
            $acceptUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "/telas/auth/register.html?invite=" . $token;

            $subject = "Convite para participar do grupo";
            $message = "Olá,\n\nVocê foi convidado(a) para participar do grupo. Para aceitar o convite, clique no link abaixo e conclua seu cadastro (ou use sua conta existente):\n\n" . $acceptUrl . "\n\nSe você não solicitou este convite, ignore esta mensagem.";
            $headers = 'From: no-reply@dispexa.local' . "\r\n";
            // tente enviar
            try {
                @mail($email, $subject, $message, $headers);
            } catch (Exception $e) {
                // falha silenciosa, o convite permanece no banco
            }

            echo json_encode(['success' => true, 'invite_id' => $inviteId, 'token' => $token]);
            break;

        case 'remove_member':
            $input = json_decode(file_get_contents('php://input'), true);
            $grupoId = $input['grupo_id'] ?? null;
            $usuarioId = $input['usuario_id'] ?? null;
            if (!$grupoId || !$usuarioId) throw new Exception('grupo_id e usuario_id obrigatórios');
            // no novo modelo removemos a associação limpando usuarios.grupo_id
            $stmt = $pdo->prepare("UPDATE usuarios SET grupo_id = NULL WHERE id = ? AND grupo_id = ?");
            $stmt->execute([$usuarioId, $grupoId]);
            echo json_encode(['success' => true]);
            break;

        case 'accept_invite':
            // URL: ?action=accept_invite&token=...
            $token = $_GET['token'] ?? null;
            if (!$token) throw new Exception('token obrigatório');
            $stmt = $pdo->prepare("SELECT * FROM grupo_convites WHERE token = ? AND status = 'pending' AND expires_at > NOW()");
            $stmt->execute([$token]);
            $invite = $stmt->fetch();
            if (!$invite) throw new Exception('Convite inválido ou expirado');

            // verificar email e adicionar ao grupo
            if (isset($_SESSION['usuario_id'])) {
                if ($_SESSION['usuario_email'] !== $invite['email']) {
                    throw new Exception('O e-mail da sua conta não corresponde ao e-mail convidado');
                }
                // associar usuário ao grupo usando usuarios.grupo_id
                $stmt2 = $pdo->prepare("UPDATE usuarios SET grupo_id = ? WHERE id = ?");
                $stmt2->execute([$invite['grupo_id'], $_SESSION['usuario_id']]);
                // marcar convite como aceito
                $stmt3 = $pdo->prepare("UPDATE grupo_convites SET status = 'accepted', responded_at = NOW() WHERE id = ?");
                $stmt3->execute([$invite['id']]);
                echo json_encode(['success' => true, 'message' => 'Convite aceito e usuário adicionado ao grupo']);
            } else {
                // se não logado, redirecionar para registro com token
                echo json_encode(['success' => true, 'need_register' => true, 'email' => $invite['email'], 'token' => $token]);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Ação inválida']);
    }

} catch (PDOException $e) {
    error_log('GrupoController PDO error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

?>