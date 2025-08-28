<?php

require_once '../../backend/config/verificar_login.php';

// Log da ação de logout
if (isset($_SESSION['usuario_email'])) {
    error_log("Logout realizado: {$_SESSION['usuario_email']} em " . date('Y-m-d H:i:s'));
}

// Destruir sessão
destruirSessao();

//requisição AJAX
// if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
//     strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    
//     header('Content-Type: application/json');
//     echo json_encode([
//         'success' => true,
//         'message' => 'Logout realizado com sucesso'
//     ]);
//     exit();
// }

// Se for requisição normal, redirecionar
header("Location: login/login.html");
exit();
?>