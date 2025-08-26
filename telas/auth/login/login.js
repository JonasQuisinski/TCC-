document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('senha');
    const togglePassword = document.querySelector('.toggle-password');
    const showPasswordBtn = document.getElementById('showPassword');
    const rememberCheckbox = document.querySelector('input[name="remember"]');
    
    if (!loginForm || !passwordInput) {
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

    

    // FORÇA DA SENHA
    passwordInput.addEventListener('input', function() {
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        
        if (passwordInput.value.length > 0) {
            let strength = 'fraca';
            let strengthClass = 'weak';
            
            if (passwordInput.value.length > 8) {
                strength = 'média';
                strengthClass = 'medium';
            }
            if (passwordInput.value.length > 12 && /[A-Z]/.test(passwordInput.value) && /\d/.test(passwordInput.value)) {
                strength = 'forte';
                strengthClass = 'strong';
            }
            
            strengthIndicator.textContent = `Força da senha: ${strength}`;
            strengthIndicator.classList.add(strengthClass);
            
            const existingIndicator = document.querySelector('.password-strength');
            if (existingIndicator) {
                existingIndicator.replaceWith(strengthIndicator);
            } else {
                passwordInput.parentNode.appendChild(strengthIndicator);
            }
        } else {
            const existingIndicator = document.querySelector('.password-strength');
            if (existingIndicator) {
                existingIndicator.remove();
            }
        }
    });

    // LOGIN
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email')?.value;
        const password = passwordInput.value;
        const rememberMe = rememberCheckbox?.checked;
        
      /*  if (!email || !password) {
            alert('Por favor, preencha todos os campos!');
            return;
        }*/
        
      const loginButton = loginForm.querySelector('.login-button');
        if (loginButton) {
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            loginButton.disabled = true;
        }
        
        setTimeout(() => {
            const loginSuccess = true;
            
            if (loginSuccess) {
                alert('Login realizado com sucesso!');
                window.location.href = '../../painel/painel.html';
            } else {
                alert('Credenciais incorretas!');
                if (loginButton) {
                    loginButton.innerHTML = 'Entrar';
                    loginButton.disabled = false;
                }
            }
        }, 1500);
    });

 
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