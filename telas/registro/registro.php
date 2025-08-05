<?php
//Hablita os erros do PHP
//QUando aparece erro 500 ele não mostra os erros por segurança//



ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);


// Conexão
$conn = new mysqli("localhost", "root", "root", "tcc");
if ($conn->connect_error) die("Erro: " . $conn->connect_error);


// Inserção
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = $_POST['nome'];
    $datanascimento = $_POST['datanascimento'];
    $email = $_POST['email'];
    $senha = $_POST['senha'];
    $sql = "INSERT INTO usuario (nome, data_nascimento, email, senha)
     VALUES ('$nome', '$datanascimento', '$email', '$senha')";
    if ($conn->query($sql) === TRUE) {
        header('Location: ../painel/painel.html');
    } else {
        echo "Erro: " . $conn->error;
    }}
    ?>