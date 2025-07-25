
document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const btnNovaCategoria = document.getElementById('btnNovaCategoria');
    const modal = document.getElementById('modalCategoria');
    const closeModal = document.querySelector('.close-modal');
    const btnCancelar = document.getElementById('btnCancelar');
    const formCategoria = document.getElementById('formCategoria');
    const tabelaCategorias = document.getElementById('tabelaCategorias');
    const inputBusca = document.getElementById('inputBusca');
    const filtroStatus = document.getElementById('filtroStatus');

    // Inputs do modal
    const inputId = document.getElementById('categoriaId');
    const inputNome = document.getElementById('nome');
    const inputDescricao = document.getElementById('descricao');
    const inputStatus = document.getElementById('status');

    const BASE_URL = 'http://localhost:3000/backend/controllers/CategoriaController.php';
    

    //Sidebar
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-visible');
        });
    }

    //abrir o modal de categoria
    function abrirModal(edicao = false, categoria = {}) {
        const titulo = document.getElementById('modalTitulo');
        if (titulo) titulo.textContent = edicao ? 'Editar Categoria' : 'Nova Categoria';

        if (inputId) inputId.value = categoria.id_categoria || '';
        if (inputNome) inputNome.value = categoria.nome || '';
        if (inputDescricao) inputDescricao.value = categoria.descricao || '';
        if (inputStatus) inputStatus.value = categoria.status || 'ativo';

        modal.style.display = 'block';
    }

    function fecharModal() {
        modal.style.display = 'none';
        formCategoria.reset();
        if (inputId) inputId.value = '';
    }

    if (btnNovaCategoria) btnNovaCategoria.addEventListener('click', () => abrirModal(false));
    if (closeModal) closeModal.addEventListener('click', fecharModal);
    if (btnCancelar) btnCancelar.addEventListener('click', fecharModal);
    window.addEventListener('click', e => {
        if (e.target === modal) fecharModal();
    });

    //tratar respostas JSON ou erro
    async function fetchJSON(url, options) {
        const res = await fetch(url, options);
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Resposta não é JSON válido:', text);
            throw new Error('Resposta inválida do servidor');
        }
    }

    // CRUD
    async function listarCategorias() {
        return fetchJSON(`${BASE_URL}?action=listar`);
    }

    async function criarCategoria(dados) {
        const form = new FormData();
        form.append('nome', dados.nome);
        form.append('descricao', dados.descricao);
        form.append('status', dados.status);
        return fetchJSON(`${BASE_URL}?action=criar`, { method: 'POST', body: form });
    }

    async function editarCategoriaAPI(id, dados) {
        const form = new FormData();
        form.append('id_categoria', id);
        form.append('nome', dados.nome);
        form.append('descricao', dados.descricao);
        form.append('status', dados.status);
        return fetchJSON(`${BASE_URL}?action=editar`, { method: 'POST', body: form });
    }

    async function excluirCategoriaAPI(id) {
        const form = new FormData();
        form.append('id_categoria', id);
        return fetchJSON(`${BASE_URL}?action=deletar`, { method: 'POST', body: form });
    }

    // Renderização e filtros
    function filtrar(cats) {
        const termo = inputBusca?.value.toLowerCase() || '';
        const status = filtroStatus?.value || '';
        return cats.filter(c => {
            const busca = c.nome.toLowerCase().includes(termo) || c.descricao.toLowerCase().includes(termo);
            const stat = status ? (c.status === status) : true;
            return busca && stat;
        });
    }

    function atualizarTabela(cats) {
        tabelaCategorias.innerHTML = filtrar(cats).map(c => `
      <tr>
        <td>${c.nome}</td>
        <td>${c.descricao}</td>
        <td><span class="status-badge status-${c.status}">${c.status}</span></td>
        <td>
          <button class="btn-editar" data-id="${c.id_categoria}"> <i class="fas fa-edit"></i></button>
          <button class="btn-excluir" data-id="${c.id_categoria}"><i class="fas fa-trash-alt"></i></button>
        </td>
      </tr>
    `).join('');

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const cat = cats.find(x => x.id_categoria == id);
                abrirModal(true, cat);
            });
        });

        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Confirma exclusão?')) {
                    await excluirCategoriaAPI(btn.dataset.id);
                    carregar();
                }
            });
        });
    }

    // Submissão do form
    formCategoria.addEventListener('submit', async e => {
        e.preventDefault();
        const dados = { nome: inputNome.value, descricao: inputDescricao.value, status: inputStatus.value };
        try {
            if (inputId.value) await editarCategoriaAPI(inputId.value, dados);
            else await criarCategoria(dados);
            fecharModal();
            carregar();
        } catch (err) {
            alert(err.message);
        }
    });

    // Inicialização
    async function carregar() {
        try {
            const cats = await listarCategorias();
            atualizarTabela(cats);
        } catch (err) {
            console.error(err);
            tabelaCategorias.innerHTML = '<tr><td colspan="4">Erro ao carregar categorias</td></tr>';
        }
    }

    carregar();
});
