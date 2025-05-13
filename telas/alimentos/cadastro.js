document.addEventListener('DOMContentLoaded', function() {
    const formAlimento = document.getElementById('formAlimento');
    const btnCancelar = document.getElementById('btnCancelar');
    
    // Validação do formulário
    formAlimento.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validarFormulario()) {
            const alimentoData = coletarDadosFormulario();
            salvarAlimento(alimentoData);
        }
    });
    
    // Cancelar cadastro
    btnCancelar.addEventListener('click', function() {
        if (confirm('Deseja realmente cancelar o cadastro? Todos os dados serão perdidos.')) {
            window.location.href = '../../telas/alimentos/listagem.html';
        }
    });
    
    // Função para validar o formulário
    function validarFormulario() {
        let valido = true;
        const camposObrigatorios = formAlimento.querySelectorAll('[required]');
        
        camposObrigatorios.forEach(campo => {
            if (!campo.value.trim()) {
                campo.style.borderColor = 'var(--color-danger)';
                valido = false;
                
                // Adiciona mensagem de erro
                const errorMsg = document.createElement('small');
                errorMsg.textContent = 'Este campo é obrigatório';
                errorMsg.style.color = 'var(--color-danger)';
                errorMsg.className = 'error-msg';
                
                // Remove mensagem anterior se existir
                const existingError = campo.nextElementSibling;
                if (existingError && existingError.className === 'error-msg') {
                    existingError.remove();
                }
                
                campo.after(errorMsg);
            } else {
                campo.style.borderColor = 'var(--color-gray-300)';
                const errorMsg = campo.nextElementSibling;
                if (errorMsg && errorMsg.className === 'error-msg') {
                    errorMsg.remove();
                }
            }
        });
        
        return valido;
    }
    
    // Coletar dados do formulário
    function coletarDadosFormulario() {
        return {
            nome: document.getElementById('nome').value,
            categoria: document.getElementById('categoria').value,
            quantidade: document.getElementById('quantidade').value,
            unidade: document.getElementById('unidade').value,
            validade: document.getElementById('validade').value,
            local: document.getElementById('local').value,
            descricao: document.getElementById('descricao').value,
            dataCadastro: new Date().toISOString()
        };
    }
    
    // Simular salvamento (substituir por chamada API real)
    function salvarAlimento(alimentoData) {
        // Mostrar loading
        const btnSubmit = formAlimento.querySelector('button[type="submit"]');
        const originalText = btnSubmit.textContent;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        btnSubmit.disabled = true;
        
        // Simular requisição assíncrona
        setTimeout(() => {
            // Aqui você faria a chamada real para a API
            console.log('Dados para salvar:', alimentoData);
            
            // Simular resposta
            const success = true; // Simular sucesso
            
            if (success) {
                alert('Alimento cadastrado com sucesso!');
                formAlimento.reset();
                window.location.href = '../../telas/alimentos/listagem.html';
            } else {
                alert('Erro ao cadastrar alimento. Tente novamente.');
            }
            
            // Restaurar botão
            btnSubmit.textContent = originalText;
            btnSubmit.disabled = false;
        }, 1500);
    }
    
    // Preencher campos se for edição (exemplo)
    function preencherFormularioSeEdicao() {
        const urlParams = new URLSearchParams(window.location.search);
        const alimentoId = urlParams.get('id');
        
        if (alimentoId) {
            // Simular busca de dados (substituir por API real)
            const alimentoEditando = {
                nome: 'Maçã',
                categoria: '1',
                quantidade: '5',
                unidade: 'un',
                validade: '2023-12-31',
                local: 'geladeira',
                descricao: 'Maçãs verdes'
            };
            
            document.getElementById('nome').value = alimentoEditando.nome;
            document.getElementById('categoria').value = alimentoEditando.categoria;
            document.getElementById('quantidade').value = alimentoEditando.quantidade;
            document.getElementById('unidade').value = alimentoEditando.unidade;
            document.getElementById('validade').value = alimentoEditando.validade;
            document.getElementById('local').value = alimentoEditando.local;
            document.getElementById('descricao').value = alimentoEditando.descricao;
            
            // Alterar título se for edição
            document.querySelector('.content-header h1').textContent = 'Editar Alimento';
            document.querySelector('button[type="submit"]').textContent = 'Atualizar Alimento';
        }
    }
    
    // Chamar função de preenchimento se necessário
    preencherFormularioSeEdicao();
});