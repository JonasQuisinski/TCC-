document.addEventListener("DOMContentLoaded", () => {
  // Função para renderizar alimentos no modal de consumo rápido
  function renderizarAlimentosConsumoRapido(filtro = "") {
    const lista = document.getElementById("listaAlimentosConsumo");
    if (!lista) return;
    let alimentos = alimentosCache;
    if (filtro) {
      const busca = filtro.toLowerCase();
      alimentos = alimentos.filter(a => a.nome.toLowerCase().includes(busca) || (a.observacoes ?? "").toLowerCase().includes(busca));
    }
    lista.innerHTML = "";
    if (alimentos.length === 0) {
      lista.innerHTML = `<div style='color:#666;text-align:center;padding:2rem;'>Nenhum alimento encontrado</div>`;
      return;
    }
    alimentos.forEach(alimento => {
      const div = document.createElement("div");
      div.className = "alimento-consumo-item";
      div.style.cursor = "pointer";
      div.style.padding = "0.75rem 1rem";
      div.style.borderBottom = "1px solid #eee";
      div.onmouseover = () => div.style.background = "#f7f7f7";
      div.onmouseout = () => div.style.background = "";
      div.onclick = () => {
        fecharModalSelecaoConsumo();
        abrirModalConsumo(alimento);
      };
      div.innerHTML = `
        <strong>${alimento.nome}</strong> <span style='color:#888;'>(${alimento.quantidade} ${alimento.unidade})</span>
      `;
      lista.appendChild(div);
    });
  }

  // Busca dinâmica no modal de consumo rápido
  const buscaConsumoRapido = document.getElementById("buscaConsumoRapido");
  if (buscaConsumoRapido) {
    buscaConsumoRapido.addEventListener("input", e => {
      renderizarAlimentosConsumoRapido(e.target.value);
    });
  }
  // Botão flutuante Consumo Rápido
  const fabConsumo = document.getElementById("fabConsumo");
  const modalSelecaoConsumo = document.getElementById("modalSelecaoConsumo");
  const closeModalSelecaoConsumo = modalSelecaoConsumo ? modalSelecaoConsumo.querySelector('.close-modal') : null;

  function abrirModalSelecaoConsumo() {
    if (modalSelecaoConsumo) {
      modalSelecaoConsumo.style.display = 'block';
      renderizarAlimentosConsumoRapido();
    }
  }
  function fecharModalSelecaoConsumo() {
    if (modalSelecaoConsumo) modalSelecaoConsumo.style.display = 'none';
  }
  if (fabConsumo) fabConsumo.addEventListener('click', abrirModalSelecaoConsumo);
  if (closeModalSelecaoConsumo) closeModalSelecaoConsumo.addEventListener('click', fecharModalSelecaoConsumo);
  window.addEventListener('click', e => {
    if (e.target === modalSelecaoConsumo) fecharModalSelecaoConsumo();
  });
  listarAlimentos();
  listarCategorias();

  // Sidebar toggle
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".sidebar");
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("sidebar-visible");
    });
  }

  const form = document.getElementById("formAlimento");
  const modalAlimento = document.getElementById("modalAlimento");
  const btnNovo = document.getElementById("btnNovoAlimento");
  const btnCancelar = document.getElementById("btnCancelar");
  const closeModalAlimento = modalAlimento.querySelector('.close-modal');

  let alimentoEditando = null;

  function abrirModalAlimento() {
  form.reset();
  alimentoEditando = null;
  if (form.alimentoId) form.alimentoId.value = ""; // Limpa o campo oculto de id
  modalAlimento.style.display = 'block';
  }
  function fecharModalAlimento() {
    modalAlimento.style.display = 'none';
    form.reset();
    alimentoEditando = null;
  }

  btnNovo.addEventListener("click", abrirModalAlimento);
  btnCancelar.addEventListener("click", fecharModalAlimento);
  closeModalAlimento.addEventListener("click", fecharModalAlimento);
  window.addEventListener('click', e => {
    if (e.target === modalAlimento) fecharModalAlimento();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = new FormData(form);
    dados.set("id_categoria", form.categoria.value);
    dados.delete("categoria");
    const isEdicao = form.alimentoId.value && form.alimentoId.value !== "";
    const url = isEdicao
      ? "../../backend/controllers/AlimentoController.php?action=editar"
      : "../../backend/controllers/AlimentoController.php?action=criar";
    if (isEdicao) {
      dados.set("id_alimento", form.alimentoId.value);
    } else {
      dados.delete("id_alimento");
      dados.delete("alimentoId");
    }
    fetch(url, {
      method: "POST",
      body: dados,
    })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) {
          fecharModalAlimento();
          alimentoEditando = null;
          listarAlimentos();
          mostrarNotificacao('Alimento salvo com sucesso!', 'success');
        } else {
          mostrarNotificacao('Erro ao salvar alimento', 'error');
        }
      })
      .catch((err) => {
        console.error(err);
        mostrarNotificacao('Erro ao comunicar com o servidor', 'error');
      });
// Notificação visual
function mostrarNotificacao(mensagem, tipo = 'success') {
  let notif = document.getElementById('notificacaoAlimento');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notificacaoAlimento';
    notif.style.position = 'fixed';
    notif.style.top = '20px';
    notif.style.right = '20px';
    notif.style.zIndex = '9999';
    notif.style.padding = '1rem 2rem';
    notif.style.borderRadius = '8px';
    notif.style.fontWeight = 'bold';
    notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    document.body.appendChild(notif);
  }
  notif.textContent = mensagem;
  notif.style.background = tipo === 'success' ? '#4caf50' : '#f44336';
  notif.style.color = '#fff';
  notif.style.display = 'block';
  setTimeout(() => {
    notif.style.display = 'none';
  }, 2500);
}
  });

  const formConsumo = document.getElementById("formConsumo");
  const modalConsumo = document.getElementById("modalConsumo");
  const btnCancelarConsumo = modalConsumo.querySelector('button.btn-secondary');
  const closeModalConsumo = modalConsumo.querySelector('.close-modal');

  function abrirModalConsumo(alimento) {
    document.getElementById("consumoAlimentoId").value = alimento.id_alimento || alimento.id;
    document.getElementById("consumoNomeAlimento").textContent = alimento.nome;
    document.getElementById("consumoEstoqueAtual").textContent = `${alimento.quantidade} ${alimento.unidade}`;
    document.getElementById("unidadeConsumo").textContent = alimento.unidade;
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById("dataConsumo").value = hoje;
    document.getElementById("quantidadeConsumo").value = "";
    document.getElementById("observacoesConsumo").value = "";
    modalConsumo.style.display = 'block';
  }
  function fecharModalConsumo() {
    modalConsumo.style.display = 'none';
    formConsumo.reset();
  }
  btnCancelarConsumo.addEventListener('click', fecharModalConsumo);
  closeModalConsumo.addEventListener('click', fecharModalConsumo);
  window.addEventListener('click', e => {
    if (e.target === modalConsumo) fecharModalConsumo();
  });

  if (formConsumo) {
    formConsumo.addEventListener("submit", function (e) {
      e.preventDefault();
      const dados = new FormData();
      dados.append("id_alimento", document.getElementById("consumoAlimentoId").value);
      dados.append("quantidade", document.getElementById("quantidadeConsumo").value);
      dados.append("data", document.getElementById("dataConsumo").value);
      dados.append("observacoes", document.getElementById("observacoesConsumo").value);
      fetch("../../backend/controllers/ConsumoController.php?action=registrar", {
        method: "POST",
        body: dados,
      })
        .then((res) => res.json())
        .then((resposta) => {
          if (resposta.sucesso) {
            fecharModalConsumo();
            listarAlimentos();
          } else {
            alert("Erro ao registrar consumo");
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Erro ao comunicar com o servidor");
        });
    });
  }
});

function fecharModalAlimento() {
  const modalEl = document.getElementById("modalAlimento");
  if (modalEl) {
    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.hide();
  }
}
function fecharModalConsumo() {
  const modal = document.getElementById("modalConsumo");
  if (modal) new bootstrap.Modal(modal).hide();
}

document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    const modalEl = btn.closest('.modal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalInstance.hide();
    }
  });
});

document.getElementById('btnCancelar')?.addEventListener('click', fecharModalAlimento);

// Filtros
const inputBusca = document.getElementById("inputBusca");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroStatus = document.getElementById("filtroStatus");

if (inputBusca) inputBusca.addEventListener("input", aplicarFiltros);
if (filtroCategoria) filtroCategoria.addEventListener("change", aplicarFiltros);
if (filtroStatus) filtroStatus.addEventListener("change", aplicarFiltros);

let alimentosCache = [];
let paginaAtual = 1;
const itensPorPagina = 5;
// backend/controllers/AlimentoController.php?action=listar
function listarAlimentos() {
  fetch("../../backend/controllers/AlimentoController.php?action=listar")
    .then((res) => res.json())
    .then((dados) => {
      alimentosCache = dados;
      renderizarTabela(dados);
    })
    .catch((err) => {
      console.error(err);
      alert("Erro ao carregar alimentos");
    });
}

function renderizarTabela(alimentos) {
  const corpoTabela = document.getElementById("tabelaAlimentos");
  corpoTabela.innerHTML = "";
  if (!alimentos || alimentos.length === 0) {
    corpoTabela.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#666;padding:2rem;">Nenhum alimento encontrado</td></tr>`;
    renderizarPaginacao(0);
    return;
  }
  // Paginação
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const alimentosPagina = alimentos.slice(inicio, fim);

  alimentosPagina.forEach((alimento) => {
    const statusObj = calcularStatus(alimento);
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>
        <strong>${alimento.nome}</strong>
        ${alimento.observacoes ? `<br><small style='color:#666;'>${alimento.observacoes}</small>` : ""}
      </td>
      <td>${formatarCategoria(alimento.nome_categoria || alimento.categoria)}</td>
      <td>${alimento.quantidade} ${alimento.unidade}</td>
      <td>${formatarData(alimento.validade)}</td>
      <td><span class="status-badge status-${statusObj.classe}">${statusObj.texto}</span></td>
      <td>
        <button type="button" class="btn btn-warning btn-sm" title="Editar" onclick='editarAlimento(${JSON.stringify(alimento).replace(/"/g, "&quot;")})'><i class="fas fa-edit"></i></button>
        <button type="button" class="btn btn-info btn-sm" title="Registrar Consumo" onclick='abrirModalConsumo(${JSON.stringify(alimento).replace(/"/g, "&quot;")})'><i class="fas fa-minus-circle"></i></button>
        <button type="button" class="btn btn-danger btn-sm" title="Excluir" onclick='deletarAlimento(${alimento.id_alimento})'><i class="fas fa-trash-alt"></i></button>
      </td>
    `;
    corpoTabela.appendChild(linha);
  });
  renderizarPaginacao(alimentos.length);
}

function renderizarPaginacao(totalItens) {
  const paginacao = document.querySelector(".pagination");
  paginacao.innerHTML = "";
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  // Botão anterior
  const btnPrev = document.createElement("button");
  btnPrev.disabled = paginaAtual === 1;
  btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
  btnPrev.onclick = () => { paginaAtual--; renderizarTabela(alimentosCache); };
  paginacao.appendChild(btnPrev);
  // Botões de página
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === paginaAtual) btn.classList.add("active");
    btn.onclick = () => { paginaAtual = i; renderizarTabela(alimentosCache); };
    paginacao.appendChild(btn);
  }
  // Botão próximo
  const btnNext = document.createElement("button");
  btnNext.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
  btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
  btnNext.onclick = () => { paginaAtual++; renderizarTabela(alimentosCache); };
  paginacao.appendChild(btnNext);
}
function abrirModalConsumo(alimento) {
  const modalConsumo = document.getElementById("modalConsumo");
  const formConsumo = document.getElementById("formConsumo");
  if (!modalConsumo || !formConsumo) return;

  // Preenche campos do modal de consumo
  document.getElementById("consumoAlimentoId").value = alimento.id_alimento || alimento.id;
  document.getElementById("consumoNomeAlimento").textContent = alimento.nome;
  document.getElementById("consumoEstoqueAtual").textContent = `${alimento.quantidade} ${alimento.unidade}`;
  document.getElementById("unidadeConsumo").textContent = alimento.unidade;

  // Seta data atual no campo dataConsumo
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById("dataConsumo").value = hoje;

  // Limpa campo de quantidade e observações
  document.getElementById("quantidadeConsumo").value = "";
  document.getElementById("observacoesConsumo").value = "";

  new bootstrap.Modal(modalConsumo).show();
}

function aplicarFiltros() {
  let filtrados = alimentosCache;
  const busca = document.getElementById("inputBusca")?.value?.toLowerCase() || "";
  const categoria = document.getElementById("filtroCategoria")?.value || "";
  const status = document.getElementById("filtroStatus")?.value || "";

  filtrados = filtrados.filter(alimento => {
    const matchBusca = alimento.nome.toLowerCase().includes(busca) || (alimento.observacoes ?? "").toLowerCase().includes(busca);
    const matchCategoria = !categoria || alimento.id_categoria == categoria || alimento.categoria == categoria;
    const statusObj = calcularStatus(alimento);
    const matchStatus = !status || statusObj.classe === status;
    return matchBusca && matchCategoria && matchStatus;
  });
  renderizarTabela(filtrados);
}

function calcularStatus(alimento) {
  const hoje = new Date();
  const validade = new Date(alimento.validade);
  const diasParaVencer = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
  if (parseFloat(alimento.quantidade) === 0) {
    return { classe: "esgotado", texto: "Esgotado" };
  }
  if (parseFloat(alimento.quantidade) <= parseFloat(alimento.estoque_minimo)) {
    return { classe: "estoque-baixo", texto: "Estoque Baixo" };
  }
  if (diasParaVencer <= 0) {
    return { classe: "esgotado", texto: "Vencido" };
  }
  if (diasParaVencer <= 7) {
    return { classe: "vencendo", texto: "Vencendo" };
  }
  return { classe: "disponivel", texto: "Disponível" };
}

function formatarCategoria(categoria) {
  const categorias = {
    "graos": "Grãos e Cereais",
    "laticinios": "Laticínios",
    "carnes": "Carnes",
    "frutas": "Frutas",
    "vegetais": "Vegetais",
    "bebidas": "Bebidas",
    "temperos": "Temperos",
    "outros": "Outros"
  };
  return categorias[categoria] || categoria;
}

function formatarData(data) {
  if (!data) return "";
  const d = new Date(data);
  if (isNaN(d)) return data;
  return d.toLocaleDateString("pt-BR");
}

function listarCategorias() {
  fetch("../../backend/controllers/CategoriaController.php?action=listar")
    .then((res) => res.json())
    .then((categorias) => {
      // Preenche o select do filtro
      const selectFiltro = document.getElementById("filtroCategoria");
      if (selectFiltro) {
        selectFiltro.innerHTML = "<option value=''>Todas as categorias</option>";
        categorias.forEach((cat) => {
          const op = document.createElement("option");
          op.value = cat.id_categoria;
          op.textContent = cat.nome;
          selectFiltro.appendChild(op);
        });
      }
      // Preenche o select do cadastro/edição
      const selectCadastro = document.getElementById("categoria");
      if (selectCadastro) {
        selectCadastro.innerHTML = "<option value=''>Selecione</option>";
        categorias.forEach((cat) => {
          const op = document.createElement("option");
          op.value = cat.id_categoria;
          op.textContent = cat.nome;
          selectCadastro.appendChild(op);
        });
      }
    });
}

function editarAlimento(alimento) {
  const form = document.getElementById("formAlimento");
  form.nome.value = alimento.nome;
  form.categoria.value = alimento.categoria || alimento.id_categoria;
  form.quantidade.value = alimento.quantidade;
  form.unidade.value = alimento.unidade;
  form.validade.value = alimento.validade;
  form.observacoes.value = alimento.observacoes;
  alimentoEditando = alimento.id_alimento;
  form.alimentoId.value = alimento.id_alimento; // Preenche o campo oculto
  document.getElementById("modalAlimento").style.display = 'block';
}

function deletarAlimento(id) {
  if (!confirm("Tem certeza que deseja excluir este alimento?")) return;

  const dados = new FormData();
  dados.append("id_alimento", id);
  fetch("../../backend/controllers/AlimentoController.php?action=deletar", {
    method: "POST",
    body: dados,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.sucesso) {
        listarAlimentos();
      } else {
        alert("Erro ao excluir alimento");
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Erro ao comunicar com o servidor");
    });
}
