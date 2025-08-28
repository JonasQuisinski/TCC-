<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';

// $pdo = Conexao::conectar();
$acao = $_GET['action'] ?? '';

switch ($acao) {
  case 'listar':
    $stmt = $pdo->query("SELECT a.*, c.nome AS nome_categoria FROM alimento a JOIN categoria c ON a.id_categoria = c.id_categoria");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    break;

  case 'criar':
    $stmt = $pdo->prepare("INSERT INTO alimento (nome, id_categoria, quantidade, unidade, validade, observacoes) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
      $_POST['nome'],
      $_POST['id_categoria'],
      $_POST['quantidade'],
      $_POST['unidade'],
      $_POST['validade'],
      $_POST['observacoes']
    ]);
  echo json_encode(['sucesso' => true]);
    break;

  case 'editar':
  error_log('DEBUG editar: id_alimento recebido = ' . ($_POST['id_alimento'] ?? 'NÃO ENVIADO'));
    $stmt = $pdo->prepare("UPDATE alimento SET nome=?, id_categoria=?, quantidade=?, unidade=?, validade=?, observacoes=? WHERE id_alimento=?");
    $stmt->execute([
      $_POST['nome'],
      $_POST['id_categoria'],
      $_POST['quantidade'],
      $_POST['unidade'],
      $_POST['validade'],
      $_POST['observacoes'],
      $_POST['id_alimento']
    ]);
    echo json_encode(['sucesso' => true]);
    break;

  case 'deletar':
    $stmt = $pdo->prepare("DELETE FROM alimento WHERE id_alimento=?");
    $stmt->execute([$_POST['id_alimento']]);
    echo json_encode(['sucesso' => true]);
    break;

  default:
    http_response_code(400);
    echo json_encode(['erro' => 'Ação inválida']);
}
