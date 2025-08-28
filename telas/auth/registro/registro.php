<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Tratar requisições OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir arquivo de conexão com banco de dados
require_once '../../../backend/config/conexao.php';

try {
    // Verificar se é POST
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
    $nome = trim($data['nome'] ?? '');
    $email = trim($data['email'] ?? '');
    $senha = $data['senha'] ?? '';
    $dataNascimento = $data['data_nascimento'] ?? '';
    $status = null; // Conforme especificado

    // Validações básicas
    if (empty($nome)) {
        throw new Exception('Nome é obrigatório');
    }

    if (empty($email)) {
        throw new Exception('E-mail é obrigatório');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('E-mail inválido');
    }

    if (empty($senha)) {
        throw new Exception('Senha é obrigatória');
    }

    if (strlen($senha) < 6) {
        throw new Exception('Senha deve ter pelo menos 6 caracteres');
    }

    if (empty($dataNascimento)) {
        throw new Exception('Data de nascimento é obrigatória');
    }

    // Validar data de nascimento
    $dataObj = DateTime::createFromFormat('Y-m-d', $dataNascimento);
    if (!$dataObj || $dataObj->format('Y-m-d') !== $dataNascimento) {
        throw new Exception('Data de nascimento inválida');
    }

    // Verificar se usuário já existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        throw new Exception('E-mail já está cadastrado');
    }

    // Hash da senha
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    // Inserir usuário no banco
    $stmt = $pdo->prepare("
        INSERT INTO usuarios (nome, email, senha, data_nascimento, status, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    
    $result = $stmt->execute([
        $nome,
        $email,
        $senhaHash,
        $dataNascimento,
        $status
    ]);

    if (!$result) {
        throw new Exception('Erro ao salvar usuário no banco de dados');
    }

    // Obter ID do usuário criado
    $userId = $pdo->lastInsertId();

    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Usuário registrado com sucesso',
        'user_id' => $userId,
        'data' => [
            'id' => $userId,
            'nome' => $nome,
            'email' => $email,
            'data_nascimento' => $dataNascimento,
            'status' => $status
        ]
    ]);

} catch (PDOException $e) {
    // Erro de banco de dados
    error_log("Erro de banco: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);

} catch (Exception $e) {
    // Outros erros
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>