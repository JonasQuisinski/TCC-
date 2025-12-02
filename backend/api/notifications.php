<?php
// API de notificações dinâmica
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/conexao.php';

$method = $_SERVER['REQUEST_METHOD'];

// Garantir array de notificações lidas na sessão
if (!isset($_SESSION['notificacoes_lidas'])) $_SESSION['notificacoes_lidas'] = [];

if ($method === 'GET') {
  $notificacoes = [];
  try {
    // Estoque baixo (quantidade <= estoque_minimo)
    $stmt = $pdo->prepare("SELECT id_alimento, nome, quantidade, estoque_minimo, unidade FROM alimento WHERE quantidade <= estoque_minimo");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $r) {
      $id = 'low_' . $r['id_alimento'];
      $notificacoes[] = [
        'id' => $id,
        'titulo' => "Estoque baixo: {$r['nome']}",
        'mensagem' => "Quantidade: {$r['quantidade']} {$r['unidade']} (mínimo: {$r['estoque_minimo']})",
        'data' => date('Y-m-d'),
        'tipo' => 'estoque'
      ];
    }

    // Validade próxima (0..7 dias)
    $stmt2 = $pdo->prepare("SELECT id_alimento, nome, validade FROM alimento WHERE validade IS NOT NULL AND DATEDIFF(validade, CURDATE()) BETWEEN 0 AND 7");
    $stmt2->execute();
    $rows2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows2 as $r) {
      $dias = (int) ( (strtotime($r['validade']) - strtotime(date('Y-m-d'))) / 86400 );
      $id = 'exp_' . $r['id_alimento'];
      $notificacoes[] = [
        'id' => $id,
        'titulo' => "Vencimento próximo: {$r['nome']}",
        'mensagem' => "Validade em {$dias} dia(s) (" . date('d/m/Y', strtotime($r['validade'])) . ")",
        'data' => $r['validade'],
        'tipo' => 'validade'
      ];
    }

    // Filtrar notificações marcadas como lidas na sessão
    $notLidas = array_filter($notificacoes, function($n) {
      return !in_array($n['id'], $_SESSION['notificacoes_lidas']);
    });

    echo json_encode(['notificacoes' => array_values($notLidas)]);
  } catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
  }

  exit();
}

if ($method === 'POST') {
  // Espera JSON: { action: 'mark_read', id: 'low_1' }
  $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
  $action = $input['action'] ?? null;
  if ($action === 'mark_read' && !empty($input['id'])) {
    $id = $input['id'];
    if (!in_array($id, $_SESSION['notificacoes_lidas'])) {
      $_SESSION['notificacoes_lidas'][] = $id;
    }
    echo json_encode(['sucesso' => true, 'id' => $id]);
    exit();
  }

  if ($action === 'clear_read') {
    $_SESSION['notificacoes_lidas'] = [];
    echo json_encode(['sucesso' => true]);
    exit();
  }

  http_response_code(400);
  echo json_encode(['error' => 'Ação inválida']);
  exit();
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
?>
