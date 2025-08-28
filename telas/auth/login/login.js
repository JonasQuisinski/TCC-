document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('senha');
    const togglePassword = document.querySelector('.toggle-password');
    const emailInput = document.getElementById('email');
    const rememberCheckbox = document.querySelector('input[name="remember"]');
    
    if (!loginForm || !passwordInput || !emailInput) {
        console.error('Elementos essenciais não encontrados!');
        return;
    }

    // MOSTRAR SENHA
    if (togglePassword) {
        const icon = togglePassword.querySelector('i');
        
        function togglePasswordVisibility() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
                togglePassword.setAttribute('aria-label', 
                    type === 'password' ? 'Mostrar senha' : 'Ocultar senha');
            }
        }

        togglePassword.addEventListener('click', togglePasswordVisibility);
    }

    // VALIDAÇÃO DE EMAIL
    function validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // CARREGAR DADOS SALVOS (se "lembrar-me" foi marcado)
    function carregarDadosSalvos() {
        const emailSalvo = getCookie('email_lembrado');
        if (emailSalvo) {
            emailInput.value = emailSalvo;
            rememberCheckbox.checked = true;
        }
    }

    // GERENCIAR COOKIES
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
    }

    // LOGIN
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const senha = passwordInput.value;
        const lembrarMe = rememberCheckbox?.checked || false;
        
        // Validações básicas
        if (!email || !senha) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        if (!validarEmail(email)) {
            alert('Por favor, insira um e-mail válido!');
            return;
        }

        const loginButton = loginForm.querySelector('.btn-login');
        const originalButtonText = loginButton.innerHTML;
        
        // Mostrar loading
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        loginButton.disabled = true;
        
        try {
            // Enviar dados para o servidor
            const response = await fetch('login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha,
                    lembrar_me: lembrarMe
                })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                // Gerenciar "lembrar-me"
                if (lembrarMe) {
                    setCookie('email_lembrado', email, 30); // 30 dias
                } else {
                    deleteCookie('email_lembrado');
                }
                
                alert('Login realizado com sucesso!');
                
                // Redirecionar para o painel
                setTimeout(() => {
                    window.location.href = '../../painel/painel.html';
                }, 500);
                
            } else {
                alert(result.message || 'Credenciais incorretas!');
            }
            
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor!');
        } finally {
            // Restaurar botão
            loginButton.innerHTML = originalButtonText;
            loginButton.disabled = false;
        }
    });

    // Carregar dados salvos
    carregarDadosSalvos();

    // Animações dos inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        const icon = input.parentElement?.querySelector('.input-icon');
        if (!icon) return;
        
        input.addEventListener('focus', () => {
            icon.style.color = 'var(--accent-color)';
        });
        
        input.addEventListener('blur', () => {
            icon.style.color = '#999';
        });
    });
});