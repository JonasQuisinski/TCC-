<?php
require_once __DIR__ . '/session_utils.php';
header('Content-Type: application/json');

$ok = start_secure_session();
if ($ok === false) {
  echo json_encode(['logged_in' => false, 'expired' => true]);
  exit;
}

if (isset($_SESSION['usuario_id'])) {
  if (!isset($_SESSION['regenerated_at']) || (time() - $_SESSION['regenerated_at']) > 300) {
    session_regenerate_id(true);
    $_SESSION['regenerated_at'] = time();
  }
  echo json_encode([
    'logged_in' => true,
    'usuario_id' => $_SESSION['usuario_id'],
    'nome' => $_SESSION['usuario_nome'] ?? null,
    'email' => $_SESSION['usuario_email'] ?? null,
    'is_admin' => $_SESSION['is_admin'] ?? false,
    'grupo_id' => $_SESSION['grupo_id'] ?? null
  ]);
} else {
  echo json_encode(['logged_in' => false]);
}
