<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
$pdo = Conexao::conectar();

$acao = $_GET['action'] ?? '';

switch ($acao) {
  case 'listar':
    $stmt = $pdo->query("SELECT * FROM categoria");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    break;

  case 'criar':
    $stmt = $pdo->prepare("INSERT INTO categoria (nome, descricao, status) VALUES (?, ?, ?)");
    $stmt->execute([$_POST['nome'], $_POST['descricao'], $_POST['status']]);
    echo json_encode(['sucesso' => true]);
    break;

  case 'editar':
    $stmt = $pdo->prepare("UPDATE categoria SET nome=?, descricao=?, status=? WHERE id_categoria=?");
    $stmt->execute([$_POST['nome'], $_POST['descricao'], $_POST['status'], $_POST['id_categoria']]);
    echo json_encode(['sucesso' => true]);
    break;

  case 'deletar':
    $stmt = $pdo->prepare("DELETE FROM categoria WHERE id_categoria=?");
    $stmt->execute([$_POST['id_categoria']]);
    echo json_encode(['sucesso' => true]);
    break;

  default:
    http_response_code(400);
    echo json_encode(['erro' => 'Ação inválida']);
}
?>
