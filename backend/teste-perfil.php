<?php
require_once __DIR__ . '/api/session_utils.php';
header('Content-Type: text/html; charset=UTF-8');

$ok = start_secure_session();
$session_data = [
    'logged_in' => isset($_SESSION['usuario_id']),
    'session_ok' => $ok,
    'usuario_id' => $_SESSION['usuario_id'] ?? null,
    'usuario_nome' => $_SESSION['usuario_nome'] ?? null,
    'usuario_email' => $_SESSION['usuario_email'] ?? null,
    'is_admin' => $_SESSION['is_admin'] ?? false,
    'grupo_id' => $_SESSION['grupo_id'] ?? null,
    'session_id' => session_id(),
    'last_active' => $_SESSION['last_active'] ?? null
];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste - Atualizar Perfil (Mesmo Dominio)</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px; margin-right: 5px; }
        button:hover { background: #0056b3; }
        .output { margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px; font-family: monospace; white-space: pre-wrap; word-wrap: break-word; max-height: 300px; overflow-y: auto; }
        .success { color: green; background: #e8f5e9 !important; }
        .error { color: red; background: #ffebee !important; }
        .info { color: #1976d2; background: #e3f2fd !important; }
        .box { padding: 10px; margin: 10px 0; border-left: 4px solid #2196F3; background: #e3f2fd; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Teste: Atualizar Perfil (Mesmo Dominio)</h1>
        
        <div class="box">
            <strong>Status Inicial:</strong><br>
            Logado: <?php echo ($session_data['logged_in'] ? 'SIM' : 'NAO'); ?><br>
            Session ID: <?php echo $session_data['session_id']; ?><br>
            Usuario: <?php echo $session_data['usuario_nome'] ?? 'N/A'; ?>
        </div>

        <div class="form-group">
            <label>Nome:</label>
            <input type="text" id="nome" placeholder="Novo nome" value="<?php echo $session_data['usuario_nome'] ?? ''; ?>">
        </div>

        <div class="form-group">
            <label>Email:</label>
            <input type="email" id="email" placeholder="novo@email.com" value="<?php echo $session_data['usuario_email'] ?? ''; ?>">
        </div>

        <div class="form-group">
            <label>Data Nascimento (opcional):</label>
            <input type="date" id="data_nascimento">
        </div>

        <div class="form-group">
            <button onclick="atualizarPerfil()">Atualizar Perfil (SEM LOGOUT)</button>
            <button onclick="location.reload()">Recarregar Pagina</button>
        </div>

        <div class="output" id="output">Preencha os dados e clique em "Atualizar Perfil"...</div>
    </div>

    <script>
        async function atualizarPerfil() {
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const data_nascimento = document.getElementById('data_nascimento').value;

            if (!nome || !email) {
                mostrarOutput('Erro: Nome e email sao obrigatorios', 'error');
                return;
            }

            console.log('Atualizando perfil...', { nome, email, data_nascimento });
            mostrarOutput('Enviando... Aguarde...', 'info');

            try {
                const res = await fetch('./controllers/UsuarioController.php?action=atualizar_perfil', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, data_nascimento })
                });

                const json = await res.json();
                console.log('Status:', res.status, 'Resposta:', json);

                if (json.sucesso) {
                    mostrarOutput('SUCESSO! Perfil atualizado.\n\nRecarregue a pagina para confirmar que NAO foi feito logout.\n\n' + JSON.stringify(json, null, 2), 'success');
                } else {
                    mostrarOutput('Erro: ' + (json.erro || 'Desconhecido') + '\n\n' + JSON.stringify(json, null, 2), 'error');
                }
            } catch(e) {
                mostrarOutput('Erro ao fazer request: ' + e.message + '\n\nDetalhe: ' + e.stack, 'error');
            }
        }

        function mostrarOutput(msg, classe = 'info') {
            const el = document.getElementById('output');
            el.textContent = msg;
            el.className = 'output ' + classe;
        }
    </script>
</body>
</html>
