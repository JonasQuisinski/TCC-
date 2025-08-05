<?php
//Hablita os erros do PHP
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

session_start();

// Conexão com o banco
$conn = new mysqli("localhost", "root", "root", "tcc");
if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

// Verifica login

$email = $_POST['email'];
$senha = $_POST['senha'];

// Busca usuário pelo email
$sql = "SELECT * FROM usuarios WHERE email='$email' and senha='$senha'";
$res = $conn->query($sql);

// ADICIONE ESTA VERIFICAÇÃO PARA PEGAR ERROS DO SQL!
if ($res === FALSE) {
    die("Erro na consulta SQL: " . $conn->error . " Query: " . $sql);
}

if ($res->num_rows > 0) {
    /*usar session*/ $_SESSION['usuario'] = $res->fetch_assoc();
    header("Location: ../../painel/painel.html");
    exit;
} else {
    $erro = "Usuario não encontrado.";
    // Para exibir o erro na tela, você precisa dar um echo nele:
    echo $erro;
}
?>