<?php
// backend/config/conexao.php - Arquivo de conexão com banco de dados


$host = 'localhost';
$dbname = 'tcc'; 
$username = 'root';  
$password = 'root';      

try {
    // Criar conexão PDO
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    
    // Teste de conexão bem-sucedida
    // Remova esta linha em produção
    // echo "Conexão estabelecida com sucesso!";
    
} catch (PDOException $e) {
    // Log do erro detalhado para desenvolvimento
    error_log("Erro de conexão PDO: " . $e->getMessage());
    
    // Em desenvolvimento, mostre o erro. Em produção, use mensagem genérica
    $isDevelopment = true; // ⚠️ Mude para false em produção
    
    http_response_code(500);
    
    if ($isDevelopment) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro de conexão: ' . $e->getMessage(),
            'debug' => [
                'host' => $host,
                'database' => $dbname,
                'username' => $username
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro interno do servidor'
        ]);
    }
    
    exit();
}
?>