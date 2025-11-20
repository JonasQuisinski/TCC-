<?php

function start_secure_session($timeoutSeconds = 1800) {

    // detecta HTTPS
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');

    // Permite sobrescrever SameSite e Secure via variáveis de ambiente para testes locais
    // Ex.: export APP_SESSION_SAMESITE=None
    // Ex.: export APP_FORCE_SESSION_SECURE=1
    $envSameSite = getenv('APP_SESSION_SAMESITE'); // None | Lax | Strict
    $envForceSecure = getenv('APP_FORCE_SESSION_SECURE'); // '1' para forçar secure

    $samesite = $envSameSite ? $envSameSite : 'Lax';
    $forceSecure = $envForceSecure === '1';

    // se SameSite=None for selecionado, browsers exigem Secure=true
    if (strtolower($samesite) === 'none') {
        $secure = true;
    }
    if ($forceSecure) $secure = true;

    $cookieParams = [
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',  
        'secure' => $secure,
        'httponly' => true,
        'samesite' => $samesite
    ];

    if (PHP_VERSION_ID < 70300) {
        session_set_cookie_params($cookieParams['lifetime'], $cookieParams['path'] . '; samesite=' . $cookieParams['samesite'], $cookieParams['domain'], $cookieParams['secure'], $cookieParams['httponly']);
    } else {
        session_set_cookie_params($cookieParams);
    }

    if (session_status() === PHP_SESSION_NONE) session_start();

    // Timeout por inatividade
    if (!isset($_SESSION['last_active'])) {
        $_SESSION['last_active'] = time();
    } else {
        $inactive = time() - $_SESSION['last_active'];
        if ($inactive > $timeoutSeconds) {
            // destruir sessão por inatividade
            $_SESSION = [];
            if (ini_get('session.use_cookies')) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params['path'], $params['domain'], $params['secure'] ?? false, $params['httponly'] ?? false);
            }
            session_destroy();
            return false; // sessão expirada
        }
        // atualiza último acesso
        $_SESSION['last_active'] = time();
    }

    return true;
}

function require_login_json() {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (!isset($_SESSION['usuario_id'])) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['logged_in' => false, 'error' => 'not_authenticated']);
        exit;
    }
}

function logout_session() {
    if (session_status() === PHP_SESSION_NONE) session_start();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'], $params['secure'] ?? false, $params['httponly'] ?? false);
    }
    session_destroy();
}
