// Seletores DOM
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

// Dados das categorias (simulando um banco de dados)
let categorias = JSON.parse(localStorage.getItem('categorias')) || [
    { id: 1, nome: "Proteínas", descricao: "Carnes, ovos e leguminosas", status: "ativo" },
    { id: 2, nome: "Carboidratos", descricao: "Pães, massas e cereais", status: "ativo" },
    { id: 3, nome: "Lácteos", descricao: "Leite, queijos e iogurtes", status: "inativo" }
];

// Toggle da Sidebar
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-visible');
});

// Gerenciamento do Modal
function abrirModal(edicao = false, categoria = null) {
    document.getElementById('modalTitulo').textContent = 
        edicao ? "Editar Categoria" : "Nova Categoria";
    
    if (edicao && categoria) {
        document.getElementById('categoriaId').value = categoria.id;
        document.getElementById('nome').value = categoria.nome;
        document.getElementById('descricao').value = categoria.descricao;
        document.getElementById('status').value = categoria.status;
    } else {
        formCategoria.reset();
        document.getElementById('status').value = "ativo";
    }
    
    modal.style.display = 'block';
}

function fecharModal() {
    modal.style.display = 'none';
    formCategoria.reset();
}

btnNovaCategoria.addEventListener('click', () => abrirModal());
closeModal.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);

window.addEventListener('click', (event) => {
    if (event.target === modal) fecharModal();
});

// CRUD de Categorias
function salvarCategoria(e) {
    e.preventDefault();
    
    const categoriaId = document.getElementById('categoriaId').value;
    const dados = {
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        status: document.getElementById('status').value
    };

    if (categoriaId) {
        // Atualizar categoria existente
        const index = categorias.findIndex(c => c.id == categoriaId);
        if (index !== -1) {
            categorias[index] = { ...categorias[index], ...dados };
        }
    } else {
        // Criar nova categoria
        const novaCategoria = {
            id: categorias.length > 0 ? Math.max(...categorias.map(c => c.id)) + 1 : 1,
            ...dados
        };
        categorias.push(novaCategoria);
    }

    salvarNoLocalStorage();
    atualizarTabela();
    fecharModal();
}

function editarCategoria(id) {
    const categoria = categorias.find(c => c.id == id);
    if (categoria) abrirModal(true, categoria);
}

function excluirCategoria(id) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        categorias = categorias.filter(c => c.id != id);
        salvarNoLocalStorage();
        atualizarTabela();
    }
}

// Funções auxiliares
function salvarNoLocalStorage() {
    localStorage.setItem('categorias', JSON.stringify(categorias));
}

function filtrarCategorias() {
    const termo = inputBusca.value.toLowerCase();
    const status = filtroStatus.value;
    
    return categorias.filter(categoria => {
        const matchBusca = categoria.nome.toLowerCase().includes(termo) || 
                          categoria.descricao.toLowerCase().includes(termo);
        const matchStatus = status ? categoria.status === status : true;
        return matchBusca && matchStatus;
    });
}

function atualizarTabela() {
    const categoriasFiltradas = filtrarCategorias();
    
    tabelaCategorias.innerHTML = categoriasFiltradas.map(categoria => `
        <tr>
            <td>${categoria.nome}</td>
            <td>${categoria.descricao}</td>
            <td><span class="status-badge status-${categoria.status}">
                ${categoria.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </span></td>
            <td class="acoes-cell">
                <button class="btn-acao btn-editar" data-id="${categoria.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-acao btn-excluir" data-id="${categoria.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Adicionar eventos aos botões
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => 
            editarCategoria(btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', () => 
            excluirCategoria(btn.getAttribute('data-id')));
    });
}

// Event Listeners
formCategoria.addEventListener('submit', salvarCategoria);
inputBusca.addEventListener('input', atualizarTabela);
filtroStatus.addEventListener('change', atualizarTabela);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('categorias')) {
        salvarNoLocalStorage();
    }
    atualizarTabela();
});