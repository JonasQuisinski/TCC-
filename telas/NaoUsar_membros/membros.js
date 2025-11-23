/*
class GestaoMembros {
    constructor() {
        this.alimentos = this.carregarAlimentos();
        this.inicializar();
    }
    inicializar() {
        this.configurarEventos();
        this.renderizarTabela();
        this.configurarDataAtual();
    }

    configurarEventos() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        sidebar = document.querySelector('.sidebar');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('sidebar-visible');
            });
        }
        const btnNovoMembro = document.getElementById('btnNovoMembro');
        const tabelaMembros = document.getElementById('tabelaMembros');
        const inputBusca = document.getElementById('inputBusca');
        const filtroStatus = document.getElementById('filtroStatus');
        const modal = document.getElementById('modalMembro');
        const closeModal = document.querySelector('.close-modal');
        const modalTitulo = document.getElementById('modalTitulo');
        const formMembro = document.getElementById('formMembro');
        const btnCancelar = document.getElementById('btnCancelar');

        btnNovoMembro.addEventListener('click', () => this.abrirModalMembro);

        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
        btnCancelar.addEventListener('click', () => {
            modalTitulo.style.display = 'none';
        });
        formMembro.addEventListener('submit', (e) =>this.salvarMembros(e));


    }
    salvarMembros() {
        localStorage.setItem('membros', JSON.stringify(this.membros));

    }

    abrirModalMembro(id = null) {
        const modal = document.getElementById('modalMembro')
        const titulo = document.getElementById('modalTitulo');
        const form = document.getElementById('formMembro')
        if (id) {
            titulo.textContent = 'Editar Membro';
            this.preencherFormulario(id);
        } else {
            titulo.textContent = 'Adicionar novo Membro';
            form.reset();
            document.getElementById('membroId').value = '';

        }
        modal.style.display = 'block';
    }

}
*/






document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('DOMContentLoaded', function () {
        // Toggle da Sidebar
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mainContent = document.getElementById('mainContent');
        if(sidebarToggle){
            sidebarToggle.addEventListener('click', ()=>{
                sidebar.classList.toggle('sidebar-visible');

            });
        }

        // Verifica o estado inicial (para desktop/mobile)
        function checkScreenSize() {
            if (window.innerWidth <= 992) {
                // Mobile - sidebar começa oculta
                sidebar.classList.remove('sidebar-visible');
                sidebarToggle.style.display = 'flex';
            } else {
                // Desktop - sidebar sempre visível
                sidebar.classList.add('sidebar-visible');
                sidebarToggle.style.display = 'none';
            }
        }

        // Toggle da sidebar
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('sidebar-visible');


        });

        // Fechar sidebar ao clicar em um item (mobile)
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove('sidebar-visible');
                }
            });
        });

        // Verificar ao carregar e redimensionar
        window.addEventListener('resize', checkScreenSize);
        checkScreenSize();

    });

    // Dados simulados (substituir por API real)
    let membros = [
        {
            id: 1,
            nome: "João Silva",
            dataNascimento: "1990-05-15",
            idade: 32,
            responsavel: true,
            status: "inativo",
            foto: ""
        },
        {
            id: 2,
            nome: "Maria Santos",
            dataNascimento: "1992-08-22",
            idade: 30,
            responsavel: true,
            status: "ativo",
            foto: ""
        }

    ];

    // Elementos da página
    const tabelaMembros = document.getElementById('tabelaMembros');
    const btnNovoMembro = document.getElementById('btnNovoMembro');
    const inputBusca = document.getElementById('inputBusca');
    const filtroStatus = document.getElementById('filtroStatus');
    const modal = document.getElementById('modalMembro');
    const closeModal = document.querySelector('.close-modal');
    const modalTitulo = document.getElementById('modalTitulo');
    const formMembro = document.getElementById('formMembro');
    const btnCancelar = document.getElementById('btnCancelar');

    // Carregar membros na tabela
    function carregarMembros() {
        tabelaMembros.innerHTML = '';

        // Aplicar filtros
        let membrosFiltrados = [...membros];
        const termoBusca = inputBusca.value.toLowerCase();
        const filtro = filtroStatus.value;

        if (termoBusca) {
            membrosFiltrados = membrosFiltrados.filter(m =>
                m.nome.toLowerCase().includes(termoBusca)
            );
        }

        if (filtro) {
            membrosFiltrados = membrosFiltrados.filter(m =>
                m.status === filtro
            );
        }

        // Preencher tabela
        membrosFiltrados.forEach(membro => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${membro.nome}</td>
                <td>${membro.idade} anos</td>
                <td><span class="status-badge status-${membro.status}">
                ${membro.status === 'ativo' ? 'Ativo' : 'Inativo'
                }
                </span>
                </td>
                <td class="acoes-cell">
                    <button class="btn-acao btn-editar" data-id="${membro.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-acao btn-excluir" data-id="${membro.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;

            tabelaMembros.appendChild(row);
        });

        // Adicionar eventos aos botões
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', abrirModalEdicao);
        });

        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', excluirMembro);
        });
    }

    // Abrir modal para novo membro
    btnNovoMembro.addEventListener('click', function () {
        modalTitulo.textContent = 'Adicionar novo membro';
        resetarFormulario();
        modal.style.display = 'block';
    });

    // Fechar modal
    closeModal.addEventListener('click', fecharModal);
    btnCancelar.addEventListener('click', fecharModal);

    // Fechar ao clicar fora do modal
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            fecharModal();
        }
    });

    function fecharModal() {
        if (confirm('Deseja cancelar as alterações? Os dados não salvos serão perdidos.')) {
            modal.style.display = 'none';
        }
    }

    // Abrir modal para edição
    function abrirModalEdicao(e) {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        const membro = membros.find(m => m.id === id);

        if (membro) {
            modalTitulo.textContent = 'Editar Membro';
            preencherFormulario(membro);
            modal.style.display = 'block';
        }
    }

    // Preencher formulário para edição
    function preencherFormulario(membro) {
        document.getElementById('membroId').value = membro.id;
        document.getElementById('nome').value = membro.nome;
        document.getElementById('status').value = membro.status;
        document.getElementById('dataNascimento').value = membro.dataNascimento;
        document.getElementById('responsavel').value = membro.responsavel ? 'sim' : 'nao';
    }

    // Resetar formulário
    function resetarFormulario() {
        formMembro.reset();
        document.getElementById('membroId').value = '';
    }

    // Excluir membro
    function excluirMembro(e) {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));

        if (confirm('Tem certeza que deseja excluir este membro?')) {
            membros = membros.filter(m => m.id !== id);
            carregarMembros();
            alert('Membro excluído com sucesso!');
        }
    }

    // Salvar membro (novo ou edição)
    formMembro.addEventListener('submit', function (e) {
        e.preventDefault();

        const id = document.getElementById('membroId').value;
        const nome = document.getElementById('nome').value;
        const status = document.getElementById('status').value;
        const dataNascimento = document.getElementById('dataNascimento').value;
        const responsavel = document.getElementById('responsavel').value === 'sim';
        const fotoInput = document.getElementById('foto');

        // Validação
        if (!nome || !dataNascimento) {
            alert('Por favor, preencha todos os campos obrigatórios!');
            return;
        }

        // Calcular idade
        const idade = calcularIdade(dataNascimento);

        // alguem tem que ver isso ai kkk https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfpEvSUu9cBdUjZIlYHc6z8H1rjVf3PQ1A3Q&s
        let foto = '';
        if (fotoInput.files.length > 0) {
            foto = URL.createObjectURL(fotoInput.files[0]);
        }

        // Preparar objeto
        const membro = {
            id: id ? parseInt(id) : Math.max(...membros.map(m => m.id)) + 1,
            nome,
            dataNascimento,
            idade,
            responsavel,
            status,
            foto
        };

        // Simula loading
        const btnSubmit = formMembro.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        btnSubmit.disabled = true;

        // Simula chamada API (implementar depois)
        setTimeout(() => {
            if (id) {
                // Edição
                const index = membros.findIndex(m => m.id === parseInt(id));
                if (index !== -1) {
                    membros[index] = membro;
                }
            } else {
                // Novo membro
                membros.push(membro);
            }

            // Feedback e atualização
            alert(`Membro ${id ? 'atualizado' : 'cadastrado'} com sucesso!`);
            carregarMembros();
            fecharModal();

            // Restaurar botão
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        }, 1500);
    });

    // Função para calcular idade
    function calcularIdade(dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();

        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }

        return idade;
    }

    // Filtros
    inputBusca.addEventListener('input', carregarMembros);
    filtroStatus.addEventListener('change', carregarMembros);

    // Carregar dados iniciais
    carregarMembros();
});