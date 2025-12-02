<?php
require_once __DIR__ . '/session_utils.php';
header('Content-Type: application/json');

// Destroi a sessão atual
logout_session();

echo json_encode(['ok' => true, 'message' => 'logged_out']);
