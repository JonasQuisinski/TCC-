<?php
header('Content-Type: application/json');
require_once '../api/session_utils.php';

// Nao usa require_login_json, so para debug

if (session_status() === PHP_SESSION_NONE) session_start();

echo json_encode([
    'debug' => 'Session atual',
    'session_id' => session_id(),
    'usuario_id' => $_SESSION['usuario_id'] ?? null,
    'usuario_nome' => $_SESSION['usuario_nome'] ?? null,
    'usuario_email' => $_SESSION['usuario_email'] ?? null,
    'is_admin' => $_SESSION['is_admin'] ?? null,
    'grupo_id' => $_SESSION['grupo_id'] ?? null,
    'last_active' => $_SESSION['last_active'] ?? null,
    'timestamp_servidor' => date('Y-m-d H:i:s')
]);
?>
