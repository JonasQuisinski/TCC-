document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');
    const passwordInput = document.getElementById('senha');
    const togglePassword = document.querySelector('.toggle-password');
    
    if (!registroForm || !passwordInput) {
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

    // VALIDAÇÃO DE EMAIL
    function validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // VALIDAÇÃO DE SENHA
    function validarSenha(senha) {
        return senha.length >= 6;
    }

    // REGISTRO DO USUÁRIO
    registroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const dataNascimento = document.getElementById('dataNascimento').value;
        const senha = passwordInput.value;
        
        // Validações básicas
        if (!nome || !email || !dataNascimento || !senha) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        if (!validarEmail(email)) {
            alert('Por favor, insira um e-mail válido!');
            return;
        }

        if (!validarSenha(senha)) {
            alert('A senha deve ter pelo menos 6 caracteres!');
            return;
        }

        const registerButton = registroForm.querySelector('.btn-login');
        const originalButtonText = registerButton.innerHTML;
        
        // Mostrar loading
        registerButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
        registerButton.disabled = true;
        
        try {
            // Enviar dados para o servidor
            const response = await fetch('registro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: senha,
                    data_nascimento: dataNascimento,
                    status: null
                })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                alert('Registro realizado com sucesso!');
                // Limpar formulário
                registroForm.reset();
                // Redirecionar para login ou painel
                setTimeout(() => {
                    window.location.href = '../login/login.html';
                }, 1000);
            } else {
                alert(result.message || 'Erro ao registrar usuário!');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor!');
        } finally {
            // Restaurar botão
            registerButton.innerHTML = originalButtonText;
            registerButton.disabled = false;
        }
    });

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