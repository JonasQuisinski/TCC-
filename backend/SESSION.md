# Sessão e Logout — DISPEXA

Este documento descreve como a sessão e o logout foram implementados no projeto, como testar e como integrar o logout no frontend.

> Local: `backend/session_utils.php`, `backend/api/session.php`, `backend/api/logout.php`

## Resumo rápido
- `session_utils.php` contém helpers para iniciar a sessão de forma segura, aplicar timeout por inatividade e encerrar a sessão.
- `session.php` usa o helper para iniciar a sessão com timeout e retorna JSON indicando `logged_in: true|false` (quando a sessão expirou retorna `expired: true`).
- `logout.php` destrói a sessão e retorna JSON `{ ok: true, message: 'logged_out' }`.

## Arquivos modificados / adicionados
- `backend/api/session_utils.php` (novo)
  - start_secure_session($timeoutSeconds = 1800)
  - logout_session()
  - require_login_json()
- `backend/api/session.php` (alterado)
  - Agora chama `start_secure_session()` e retorna `expired:true` quando a sessão expirou.
  - Regenera o id da sessão a cada 5 minutos (troca periódica para reduzir risco de fixation).
- `backend/api/logout.php` (novo)
  - Endpoint simples para destruir a sessão.

## Como a sessão funciona (detalhes)
1. Ao chamar `backend/api/session.php`:
   - O script chama `start_secure_session()` (que chama `session_start()` com parâmetros de cookie mais seguros: HttpOnly, SameSite=Lax e, se detectado HTTPS, `Secure=true`).
   - `start_secure_session()` mantém um timestamp em `$_SESSION['last_active']` e, se o tempo de inatividade exceder o `timeoutSeconds` (padrão 1800s = 30 minutos), destrói a sessão e retorna `false`.
   - Se a sessão está ativa e `$_SESSION['usuario_id']` estiver setado, `session.php` retorna JSON com `logged_in: true` e dados do usuário (`usuario_id`, `nome`).
   - Se a sessão expirou, `session.php` retorna `{ "logged_in": false, "expired": true }`.

2. A aplicação frontend chama `fetch('../../backend/api/session.php')` em várias páginas e, se receber `logged_in: false`, costuma redirecionar para a página de login (`telas/auth/login.html`).

## Como funciona o logout
- Endpoint: `backend/api/logout.php` (POST)
  - Simples: chama `logout_session()` que limpa `$_SESSION`, apaga cookie de sessão e chama `session_destroy()`.
  - Retorna JSON `{'ok': true, 'message': 'logged_out'}`.

- Frontend: exemplo simples (já aplicado em algumas páginas):

```html
<button id="btnLogout">Sair</button>
<script>
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', ()=>{
      fetch('../../backend/api/logout.php', { method: 'POST' })
        .then(()=> window.location.href='../../telas/auth/login.html')
        .catch(()=> window.location.href='../../telas/auth/login.html');
    });
  }
</script>
```

- Observação: o endpoint não exige payload; usar POST por semântica (mudança de estado) e para permitir futuras extensões.

## Como testar manualmente
1. Teste de sessão ativa
   - Faça login (se o sistema tiver o fluxo de login) e abra uma página protegida, ex.: `telas/painel/painel.html`.
   - A chamada ao `session.php` deve retornar `{ "logged_in": true, "usuario_id": ..., "nome": ... }`.

2. Teste de logout
   - Clique no botão Sair no header (ou execute manualmente):

Fetch (browser console):
```js
fetch('../../backend/api/logout.php', { method: 'POST' })
  .then(r => r.json())
  .then(j => console.log(j));
```

PowerShell (opcional):
```powershell
# Se estiver usando curl (PowerShell alias):
curl -Method POST "http://localhost/yourpath/backend/api/logout.php"
```

- Resultado esperado: JSON `{ "ok": true, "message": "logged_out" }` e redirecionamento à tela de login.

3. Teste de timeout
   - Espere mais de 30 minutos (ou ajuste o tempo no helper para testar). Na próxima requisição a `session.php`, deverá vir `{ "logged_in": false, "expired": true }`. Trate isso no frontend redirecionando para o login e (opcional) mostrando uma mensagem "Sessão expirada".

## Como proteger endpoints (recomendado)
- Para endpoints que retornam/alteram dados sensíveis, chame `require_login_json()` no início do controller / script para retornar 401 caso não autenticado.

Exemplo (no topo de um controller PHP):
```php
require_once __DIR__ . '/../api/session_utils.php';
start_secure_session();
if (!isset($_SESSION['usuario_id'])) {
  http_response_code(401);
  header('Content-Type: application/json');
  echo json_encode(['error' => 'not_authenticated']);
  exit;
}
// ...restante do código
```

Ou use a função helper já fornecida:
```php
require_once __DIR__ . '/../api/session_utils.php';
start_secure_session();
require_login_json();
// se chegou aqui, usuário autenticado
```

## Recomendações de segurança
- Ativar HTTPS em produção e garantir que `session.cookie_secure` seja `true`.
- Aumentar SameSite para `Strict` se não precisar enviar cookies em cross-site navigation.
 - Ativar HTTPS em produção e garantir que `session.cookie_secure` seja `true`.
 - Aumentar SameSite para `Strict` se não precisar enviar cookies em cross-site navigation.

## Variáveis de ambiente para testes e compatibilidade

Para facilitar testes locais ou cenários onde o frontend está em outro host/porta, `session_utils.php` aceita duas variáveis de ambiente opcionais:

- `APP_SESSION_SAMESITE` — define o valor de SameSite para o cookie de sessão. Valores possíveis: `Lax` (padrão), `Strict`, `None`.
  - Atenção: se usar `None`, navegadores modernos exigem que o cookie tenha `Secure=true`.
- `APP_FORCE_SESSION_SECURE` — se definido como `1`, força `secure=true` no cookie de sessão mesmo em HTTP (útil apenas para testes; em produção prefira sempre HTTPS).

Exemplos (Linux/macOS):
```bash
export APP_SESSION_SAMESITE=None
export APP_FORCE_SESSION_SECURE=1
# iniciar servidor local depois destas variáveis
```

No Windows (PowerShell):
```powershell
$env:APP_SESSION_SAMESITE = 'None'
$env:APP_FORCE_SESSION_SECURE = '1'
# iniciar servidor local depois destas variáveis
```

Use essas variáveis somente para debugging/local; em produção habilite HTTPS e prefira manter `SameSite=Lax` ou `Strict` conforme necessário.
- Regenerar session id no login e periodicamente (já há uma rotina de `regenerate` a cada 5 minutos no `session.php`).
- Para ambiente com múltiplos servidores, considerar armazenamento de sessão central (Redis) ou tokens JWT dependendo da arquitetura.

## Dicas de UX
- Quando `session.php` retornar `expired: true`, mostre um modal informando que a sessão expirou e redirecione ao login após confirmação do usuário.
- Atualizar o contador/ícone de notificações após logout para evitar chamadas desnecessárias.

## Onde ajustar o tempo de timeout
- Editar `backend/api/session_utils.php` e alterar o `start_secure_session($timeoutSeconds = 1800)` para outro valor (em segundos).

## Próximos passos sugeridos
- Proteger controllers críticos com `require_login_json()`.
- Adicionar um modal de "Sessão expirada" no frontend.
- Implementar logout em todas as páginas do header para consistência.

---

Se quiser, eu já aplico as últimas duas sugestões (proteger controllers principais + adicionar modal de sessão expirada). Diga qual prefere que eu faça agora.
