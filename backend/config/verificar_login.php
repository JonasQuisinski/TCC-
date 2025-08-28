<?php

session_start();

function verificarLogin() {
    // Verificar se há sessão ativa
    if (!isset($_SESSION['usuario_id']) || !isset($_SESSION['usuario_email'])) {
        return false;
    }
    
    // Verificar se a sessão não expirou (opcional - 24 horas)
    if (isset($_SESSION['login_time'])) {
        $tempoLimite = 24 * 60 * 60; // 24 horas em segundos
        if (time() - $_SESSION['login_time'] > $tempoLimite) {
            // Sessão expirada
            destruirSessao();
            return false;
        }
    }
    
    return true;
}

function obterUsuarioLogado() {
    if (!verificarLogin()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['usuario_id'],
        'nome' => $_SESSION['usuario_nome'],
        'email' => $_SESSION['usuario_email'],
        'login_time' => $_SESSION['login_time']
    ];
}

function destruirSessao() {
    // Destruir todas as variáveis de sessão
    $_SESSION = array();
    
    // Destruir cookie de sessão
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Destruir sessão
    session_destroy();
}

function redirecionarSeNaoLogado($paginaLogin = '../auth/login/login.html') {
    if (!verificarLogin()) {
        header("Location: $paginaLogin");
        exit();
    }
}

// Se este arquivo for chamado diretamente via AJAX, retornar status do login
if ($_SERVER['REQUEST_METHOD'] === 'GET' && 
    isset($_GET['action']) && $_GET['action'] === 'check_login') {
    
    header('Content-Type: application/json');
    
    if (verificarLogin()) {
        echo json_encode([
            'logged_in' => true,
            'user' => obterUsuarioLogado()
        ]);
    } else {
        echo json_encode([
            'logged_in' => false
        ]);
    }
    exit();
}

// Se este arquivo for chamado para logout
if ($_SERVER['REQUEST_METHOD'] === 'POST' && 
    isset($_GET['action']) && $_GET['action'] === 'logout') {
    
    header('Content-Type: application/json');
    
    destruirSessao();
    
    echo json_encode([
        'success' => true,
        'message' => 'Logout realizado com sucesso'
    ]);
    exit();
}
?>