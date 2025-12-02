<?php


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
    
    
} catch (PDOException $e) {
    error_log("Erro de conexão PDO: " . $e->getMessage());
    
    $isDevelopment = true;
    
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