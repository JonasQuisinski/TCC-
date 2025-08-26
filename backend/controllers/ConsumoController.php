<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';
$pdo = Conexao::conectar();

$acao = $_GET['action'] ?? '';

switch ($acao) {
  case 'listar':
    $stmt = $pdo->query("SELECT * FROM consumo");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    break;

  case 'registrar':
    // Espera: id_alimento, quantidade, data, observacoes
    $stmt = $pdo->prepare("INSERT INTO consumo (id_alimento, quantidade, data, observacoes) VALUES (?, ?, ?, ?)");
    $stmt->execute([
      $_POST['id_alimento'],
      $_POST['quantidade'],
      $_POST['data'],
      $_POST['observacoes'] ?? ''
    ]);
    // Atualiza o estoque do alimento
    $stmt2 = $pdo->prepare("UPDATE alimento SET quantidade = quantidade - ? WHERE id_alimento = ?");
    $stmt2->execute([
      $_POST['quantidade'],
      $_POST['id_alimento']
    ]);
    echo json_encode(['sucesso' => true]);
    break;

  case 'deletar':
    $stmt = $pdo->prepare("DELETE FROM consumo WHERE id_consumo=?");
    $stmt->execute([$_POST['id_consumo']]);
    echo json_encode(['sucesso' => true]);
    break;

  default:
    http_response_code(400);
    echo json_encode(['erro' => 'Ação inválida']);
}
?>
