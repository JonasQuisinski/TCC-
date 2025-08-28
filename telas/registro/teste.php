<?php
// telas/registro/teste.php - Arquivo para testar a conexão

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔧 Teste de Conexão - DISPEXA</h1>";

// Verificar se o arquivo de conexão existe
$conexaoPath = '../../../backend/config/conexao.php';
echo "<h2>1. Verificando arquivo de conexão:</h2>";
echo "<p>Caminho: <code>$conexaoPath</code></p>";

if (file_exists($conexaoPath)) {
    echo "<p style='color: green;'>✅ Arquivo de conexão encontrado!</p>";
    
    echo "<h2>2. Testando conexão:</h2>";
    
    try {
        require_once $conexaoPath;
        echo "<p style='color: green;'>✅ Conexão estabelecida com sucesso!</p>";
        
        // Verificar se a variável $pdo foi criada
        if (isset($pdo)) {
            echo "<p style='color: green;'>✅ Variável \$pdo está disponível</p>";
            
            // Testar query simples
            $stmt = $pdo->query("SELECT 1 as teste");
            $result = $stmt->fetch();
            if ($result) {
                echo "<p style='color: green;'>✅ Query de teste executada com sucesso</p>";
            }
            
            // Verificar se tabela usuarios existe
            echo "<h2>3. Verificando tabela usuarios:</h2>";
            try {
                $stmt = $pdo->query("DESCRIBE usuarios");
                $columns = $stmt->fetchAll();
                
                echo "<p style='color: green;'>✅ Tabela 'usuarios' encontrada</p>";
                echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
                echo "<tr style='background: #f0f0f0;'><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
                foreach ($columns as $column) {
                    echo "<tr>";
                    echo "<td>{$column['Field']}</td>";
                    echo "<td>{$column['Type']}</td>";
                    echo "<td>{$column['Null']}</td>";
                    echo "<td>{$column['Key']}</td>";
                    echo "<td>" . ($column['Default'] ?? 'NULL') . "</td>";
                    echo "<td>{$column['Extra']}</td>";
                    echo "</tr>";
                }
                echo "</table>";
                
            } catch (PDOException $e) {
                echo "<p style='color: orange;'>⚠️ Tabela 'usuarios' não encontrada</p>";
                echo "<p><strong>Execute este SQL para criar a tabela:</strong></p>";
                echo "<textarea style='width: 100%; height: 200px; font-family: monospace; font-size: 12px;'>";
                echo "CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    status VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_email ON usuarios(email);
CREATE INDEX idx_status ON usuarios(status);";
                echo "</textarea>";
            }
            
        } else {
            echo "<p style='color: red;'>❌ Variável \$pdo não foi criada</p>";
        }
        
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Erro ao incluir arquivo de conexão:</p>";
        echo "<pre style='background: #f8f8f8; padding: 10px; border-left: 3px solid #ff0000;'>";
        echo htmlspecialchars($e->getMessage());
        echo "</pre>";
    }
    
} else {
    echo "<p style='color: red;'>❌ Arquivo de conexão não encontrado!</p>";
    echo "<p><strong>Verifique se o arquivo existe em:</strong></p>";
    echo "<ul>";
    echo "<li><code>" . realpath('.') . "/../../../backend/config/conexao.php</code></li>";
    echo "</ul>";
}

echo "<h2>4. Informações do sistema:</h2>";
echo "<ul>";
echo "<li><strong>PHP Version:</strong> " . PHP_VERSION . "</li>";
echo "<li><strong>Current Directory:</strong> " . getcwd() . "</li>";
echo "<li><strong>Document Root:</strong> " . $_SERVER['DOCUMENT_ROOT'] . "</li>";
echo "<li><strong>Script Name:</strong> " . $_SERVER['SCRIPT_NAME'] . "</li>";
echo "</ul>";

// Verificar extensões necessárias
echo "<h2>5. Extensões PHP:</h2>";
$extensions = ['pdo', 'pdo_mysql', 'json'];
foreach ($extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "<p style='color: green;'>✅ $ext</p>";
    } else {
        echo "<p style='color: red;'>❌ $ext (não instalado)</p>";
    }
}

?>