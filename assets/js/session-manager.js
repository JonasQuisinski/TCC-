/**
  session-manager.js
  Gerenciador centralizado de sessao para todas as paginas
  Verifica autenticacao, redireciona para login se necessario
  Configura dados globais de usuario
 */

let usuarioAtual = null;
let isAdmin = false;
let usuarioGrupoId = null;


// Verifica se usuario esta logado, se nao estiver, redireciona 
// para login, se estiver, carrega dados na variavel global

async function verificarSessao() {
    try {
        const res = await fetch('/backend/api/session.php', { 
            credentials: 'include'
        });
        const json = await res.json();
        
        console.log('Session check:', json);
        
        if (!json.logged_in) {
            console.warn('Sessao expirada ou nao autenticada, redirecionando...');
            window.location.href = '/telas/auth/login/login.html';
            return false;
        }
        
        // Salvar dados globais
        usuarioAtual = {
            id: json.usuario_id,
            nome: json.nome,
            email: json.email
        };
        isAdmin = json.is_admin || false;
        usuarioGrupoId = json.grupo_id || null;
        
        console.log('Usuario autenticado:', usuarioAtual, 'Admin:', isAdmin);
        return true;
    } catch(e) {
        console.error('Erro ao verificar sessao:', e);
        window.location.href = '/telas/auth/login/login.html';
        return false;
    }
}


 // Configura o botao de logout

function configurarLogout() {
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                await fetch('/backend/api/logout.php', { 
                    method: 'POST',
                    credentials: 'include'
                });
            } catch(e) {
                console.error('Erro ao fazer logout:', e);
            } finally {
                window.location.href = '/telas/auth/login/login.html';
            }
        });
    }
}


// Configura notificacoes basicas

function configurarNotificacoes() {
    const notIcon = document.getElementById('notificacaoIcon');
    const notPanel = document.getElementById('notPanel');
    const notList = document.getElementById('notList');
    const notCount = document.getElementById('notCount');

    if (!notIcon || !notPanel) return;

    function carregarNotificacoes() {
        if (!notList || !notCount) return;
        fetch('/backend/api/notifications.php', { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                const items = d.notificacoes || [];
                notCount.textContent = items.length;
                notList.innerHTML = items.length 
                    ? items.map(n => `
                        <div style="padding:.5rem;border-bottom:1px solid #eee;">
                            <strong>${n.titulo}</strong>
                            <div style="font-size:.9rem;color:#555">${n.mensagem}</div>
                            <small style="color:#999">${n.data}</small>
                        </div>
                    `).join('')
                    : '<div style="color:#666">Sem notificacoes</div>';
            })
            .catch(() => notList.innerHTML = '<div style="color:#c00">Erro ao carregar</div>');
    }

    // Remover duplicatas (pode haver multiplos notificacaoIcon)
    const icons = document.querySelectorAll('#notificacaoIcon');
    if (icons.length > 1) {
        for (let i = 0; i < icons.length - 1; i++) {
            icons[i].remove();
        }
    }

    notIcon.addEventListener('click', () => {
        if (notPanel.style.display === 'block') {
            notPanel.style.display = 'none';
        } else {
            carregarNotificacoes();
            notPanel.style.display = 'block';
        }
    });

    // Carregar notificacoes inicialmente
    carregarNotificacoes();
}


async function inicializarSessao() {
    console.log('Inicializando sessao...');
    
    // Verificar autenticacao
    const ok = await verificarSessao();
    if (!ok) return;
    
    // Configurar eventos
    configurarLogout();
    configurarNotificacoes();
    
    console.log('Sessao inicializada com sucesso');
}

// Auto-inicializar quando documento carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSessao);
} else {
    inicializarSessao();
}
