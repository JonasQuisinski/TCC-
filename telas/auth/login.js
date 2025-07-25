document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('senha');
    const togglePassword = document.querySelector('.toggle-password');
    //const loginMsg = document.getElementById('loginMsg');
    const rememberCheckbox = document.querySelector('input[name="remember"]');

    if (!loginForm || !passwordInput) {
        console.error('Elementos essenciais não encontrados!');
        return;
    }

    // MOSTRAR SENHA
    if (togglePassword) {
        const icon = togglePassword.querySelector('i');
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
                togglePassword.setAttribute('aria-label', type === 'password' ? 'Mostrar senha' : 'Ocultar senha');
            }
        });
    }

    // FORÇA DA SENHA
    passwordInput.addEventListener('input', function () {
        let strengthIndicator = document.querySelector('.password-strength');
        if (!strengthIndicator) {
            strengthIndicator = document.createElement('div');
            strengthIndicator.className = 'password-strength';
            passwordInput.parentNode.appendChild(strengthIndicator);
        }
        if (passwordInput.value.length === 0) {
            strengthIndicator.textContent = '';
            return;
        }
        let strength = 'Fraca';
        let strengthClass = 'weak';
        if (passwordInput.value.length > 8) {
            strength = 'Média';
            strengthClass = 'medium';
        }
        if (passwordInput.value.length > 12 && /[A-Z]/.test(passwordInput.value) && /\d/.test(passwordInput.value)) {
            strength = 'Forte';
            strengthClass = 'strong';
        }
        strengthIndicator.textContent = `Força da senha: ${strength}`;
        strengthIndicator.className = `password-strength ${strengthClass}`;
    });

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('email')?.value;
        const password = passwordInput.value;

        const loginButton = loginForm.querySelector('#btn-login');
        if (loginButton) {
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            loginButton.disabled = true;
           
        }
         fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha: password })
            })

      
        .then(response => response.json())
            .then(data => {
                if (data.mensagem === 'Login bem-sucedido') {
                    //loginMsg.style.color = "#27ae60";
                    //loginMsg.textContent = "Login realizado com sucesso!";
                    setTimeout(() => {
                        window.location.href = '../../painel/painel.html';
                    }, 1);
                } else {
                    //loginMsg.style.color = "#d35400";
                    //loginMsg.textContent = data.mensagem || "Credenciais incorretas!";
                    if (loginButton) {
                        loginButton.innerHTML = 'Entrar';
                        loginButton.disabled = false;
                    }
                }
            })

            .catch(() => {
                //loginMsg.textContent = "Erro na conexão";
                if (loginButton) {
                    loginButton.innerHTML = 'Entrar';
                    loginButton.disabled = false;
                }
            });
    });

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        const icon = input.parentElement?.querySelector('.input-icon');
        if (!icon) return;
        input.addEventListener('focus', () => { icon.style.color = 'var(--accent-color)'; });
        input.addEventListener('blur', () => { icon.style.color = '#999'; });
    });
});