<?php
header('Content-Type: application/json');
require_once '../config/conexao.php';

$acao = $_GET['action'] ?? '';

switch ($acao) {
    // Dashboard totals
    case 'totais':
        $totalAlimentos = $pdo->query("SELECT COUNT(*) AS total FROM alimento")->fetch(PDO::FETCH_ASSOC)['total'];
        $vencendoSemana = $pdo->query("SELECT COUNT(*) AS total FROM alimento WHERE validade <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND validade >= CURDATE()")->fetch(PDO::FETCH_ASSOC)['total'];
        $estoqueBaixo = $pdo->query("SELECT COUNT(*) AS total FROM alimento WHERE quantidade <= 2 AND quantidade > 0")->fetch(PDO::FETCH_ASSOC)['total'];
        $esgotados = $pdo->query("SELECT COUNT(*) AS total FROM alimento WHERE quantidade = 0")->fetch(PDO::FETCH_ASSOC)['total'];
        echo json_encode([
            'totalAlimentos' => (int)$totalAlimentos,
            'vencendoSemana' => (int)$vencendoSemana,
            'estoqueBaixo' => (int)$estoqueBaixo,
            'esgotados' => (int)$esgotados
        ]);
        break;

    case 'por_categoria':
        $stmt = $pdo->query("
      SELECT c.nome AS categoria, COUNT(a.id_alimento) AS itens, SUM(a.quantidade) AS quantidade
      FROM alimento a
      JOIN categoria c ON a.id_categoria = c.id_categoria
      GROUP BY c.id_categoria
    ");
        $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $totalItens = array_sum(array_column($categorias, 'itens'));
        foreach ($categorias as &$cat) {
            $cat['percentual'] = $totalItens > 0 ? round($cat['itens'] / $totalItens * 100, 1) : 0;
        }
        echo json_encode($categorias);
        break;

    // Consumption by period
    case 'consumo_periodo':
        $dias = isset($_GET['dias']) ? intval($_GET['dias']) : 30;
        $stmt = $pdo->prepare("
      SELECT data, SUM(quantidade) AS total
      FROM consumo
      WHERE data >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY data
      ORDER BY data ASC
    ");
        $stmt->execute([$dias]);
        $consumo = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($consumo);
        break;

    // Most consumed items
    case 'mais_consumidos':
        $stmt = $pdo->query("
      SELECT a.nome, SUM(c.quantidade) AS total
      FROM consumo c
      JOIN alimento a ON c.id_alimento = a.id_alimento
      GROUP BY c.id_alimento
      ORDER BY total DESC
      LIMIT 5
    ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    // Upcoming expirations
    case 'vencimentos':
        $stmt = $pdo->query("
      SELECT a.nome, c.nome AS categoria, a.quantidade, a.unidade, a.validade,
             DATEDIFF(a.validade, CURDATE()) AS diasRestantes
      FROM alimento a
      JOIN categoria c ON a.id_categoria = c.id_categoria
      WHERE a.validade <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY a.validade ASC
    ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    // Low stock
    case 'estoque_baixo':
        $stmt = $pdo->query("
      SELECT a.nome, c.nome AS categoria, a.quantidade, a.unidade, 
             (1 * 2 - a.quantidade) AS sugestaoCompra
      FROM alimento a
      JOIN categoria c ON a.id_categoria = c.id_categoria
      WHERE a.quantidade <= 1
      ORDER BY a.quantidade ASC
    ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    default:
        http_response_code(400);
        echo json_encode(['erro' => 'Ação inválida']);
}
?>