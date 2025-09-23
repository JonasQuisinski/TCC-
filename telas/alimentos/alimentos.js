// Sistema de Gestão de Alimentos - DISPEXA
class GestaoAlimentos {
    constructor() {
        this.alimentos = this.carregarAlimentos();
        this.inicializar();
    }

    inicializar() {
        this.configurarEventos();
        this.renderizarTabela();
        this.configurarDataAtual();
        this.verificarAlertasVencimento();
    }

    // Todos os eventos da página
    configurarEventos() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('sidebar-visible');
            });
        }

        // Modal de alimento
        const btnNovoAlimento = document.getElementById('btnNovoAlimento');
        const modalAlimento = document.getElementById('modalAlimento');
        const closeBtns = document.querySelectorAll('.close-modal');
        const btnCancelar = document.getElementById('btnCancelar');
        const formAlimento = document.getElementById('formAlimento');

        btnNovoAlimento.addEventListener('click', () => this.abrirModalAlimento);
        
        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        btnCancelar.addEventListener('click', () => {
            modalAlimento.style.display = 'none';
        });

        formAlimento.addEventListener('submit', (e) => this.salvarAlimento(e));

        const inputBusca = document.getElementById('inputBusca');
        const filtroCategoria = document.getElementById('filtroCategoria');
        const filtroStatus = document.getElementById('filtroStatus');

        inputBusca.addEventListener('input', () => this.aplicarFiltros());
        filtroCategoria.addEventListener('change', () => this.aplicarFiltros());
        filtroStatus.addEventListener('change', () => this.aplicarFiltros());

        // Modal de consumo
        const formConsumo = document.getElementById('formConsumo');
        formConsumo.addEventListener('submit', (e) => this.registrarConsumo(e));

        // FAB Consumo rápido
        const fabConsumo = document.getElementById('fabConsumo');
        fabConsumo.addEventListener('click', () => this.abrirModalSelecaoConsumo());

        // Busca no modal de consumo rápido
        const buscaConsumoRapido = document.getElementById('buscaConsumoRapido');
        buscaConsumoRapido.addEventListener('input', () => this.filtrarAlimentosConsumo());

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // Configurar data atual nos campos de data
    configurarDataAtual() {
        const hoje = new Date();
        const dataFormatada = hoje.toISOString().split('T')[0];
        
        const dataConsumo = document.getElementById('dataConsumo');
        if (dataConsumo) {
            dataConsumo.value = dataFormatada;
        }
    }

    // Carregar alimentos do localStorage ou dados padrão
    carregarAlimentos() {
        const alimentosSalvos = localStorage.getItem('alimentos');
        if (alimentosSalvos) {
            return JSON.parse(alimentosSalvos);
        }
        
        // Dados de exemplo
        return [
            {
                id: 1,
                nome: 'Arroz Branco',
                categoria: 'graos',
                quantidade: 5.0,
                unidade: 'kg',
                validade: '2025-12-31',
                estoqueMinimo: 2.0,
                observacoes: 'Arroz tipo 1',
                dataCadastro: new Date().toISOString()
            },
            {
                id: 2,
                nome: 'Feijão Preto',
                categoria: 'graos',
                quantidade: 3.2,
                unidade: 'kg',
                validade: '2025-10-15',
                estoqueMinimo: 1.0,
                observacoes: '',
                dataCadastro: new Date().toISOString()
            },
            {
                id: 3,
                nome: 'Leite Integral',
                categoria: 'laticinios',
                quantidade: 0.5,
                unidade: 'l',
                validade: '2025-06-20',
                estoqueMinimo: 2.0,
                observacoes: 'Vencendo em breve',
                dataCadastro: new Date().toISOString()
            },
            {
                id: 4,
                nome: 'Carne Bovina',
                categoria: 'carnes',
                quantidade: 0,
                unidade: 'kg',
                validade: '2025-06-15',
                estoqueMinimo: 1.0,
                observacoes: 'Produto esgotado',
                dataCadastro: new Date().toISOString()
            },
            {
                id: 5,
                nome: 'Banana',
                categoria: 'frutas',
                quantidade: 2.5,
                unidade: 'kg',
                validade: '2025-06-13',
                estoqueMinimo: 1.0,
                observacoes: 'Fruta fresca',
                dataCadastro: new Date().toISOString()
            }
        ];
    }

    // Salvar alimentos no localStorage
    salvarAlimentos() {
        localStorage.setItem('alimentos', JSON.stringify(this.alimentos));
    }

    // Renderizar tabela de alimentos
    renderizarTabela(alimentosFiltrados = null) {
        const tbody = document.getElementById('tabelaAlimentos');
        const alimentos = alimentosFiltrados || this.alimentos;
        
        tbody.innerHTML = '';

        alimentos.forEach(alimento => {
            const tr = document.createElement('tr');
            const status = this.calcularStatus(alimento);
            
            tr.innerHTML = `
                <td>
                    <div class="nome-alimento">
                        <strong>${alimento.nome}</strong>
                        ${alimento.observacoes ? `<br><small style="color: #666;">${alimento.observacoes}</small>` : ''}
                    </div>
                </td>
                <td>${this.formatarCategoria(alimento.categoria)}</td>
                <td>${alimento.quantidade} ${alimento.unidade}</td>
                <td>${this.formatarData(alimento.validade)}</td>
                <td>
                    <span class="status-badge status-${status.classe}">${status.texto}</span>
                </td>
                <td>
                    <div class="acoes-cell">
                        <button class="btn-acao btn-editar" onclick="gestaoAlimentos.editarAlimento(${alimento.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-acao btn-consumo" onclick="gestaoAlimentos.abrirModalConsumo(${alimento.id})" title="Registrar Consumo">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="btn-acao btn-excluir" onclick="gestaoAlimentos.excluirAlimento(${alimento.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(tr);
        });

        if (alimentos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
                        Nenhum alimento encontrado
                    </td>
                </tr>
            `;
        }
    }

    // Calcular status do alimento
    calcularStatus(alimento) {
        const hoje = new Date();
        const validade = new Date(alimento.validade);
        const diasParaVencer = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));

        if (alimento.quantidade === 0) {
            return { classe: 'esgotado', texto: 'Esgotado' };
        }
        
        if (alimento.quantidade <= alimento.estoqueMinimo) {
            return { classe: 'estoque-baixo', texto: 'Estoque Baixo' };
        }
        
        if (diasParaVencer <= 0) {
            return { classe: 'esgotado', texto: 'Vencido' };
        }
        
        if (diasParaVencer <= 7) {
            return { classe: 'vencendo', texto: 'Vencendo' };
        }
        
        return { classe: 'disponivel', texto: 'Disponível' };
    }

    // Formatar categoria para exibição
    formatarCategoria(categoria) {
        const categorias = {
            'graos': 'Grãos e Cereais',
            'laticinios': 'Laticínios',
            'carnes': 'Carnes',
            'frutas': 'Frutas',
            'vegetais': 'Vegetais',
            'bebidas': 'Bebidas',
            'temperos': 'Temperos',
            'outros': 'Outros'
        };
        return categorias[categoria] || categoria;
    }

    // Formatar data para exibição
    formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    // Aplicar filtros de busca e categoria
    aplicarFiltros() {
        const busca = document.getElementById('inputBusca').value.toLowerCase();
        const categoria = document.getElementById('filtroCategoria').value;
        const status = document.getElementById('filtroStatus').value;

        const alimentosFiltrados = this.alimentos.filter(alimento => {
            const matchBusca = alimento.nome.toLowerCase().includes(busca) ||
                             alimento.observacoes.toLowerCase().includes(busca);
            
            const matchCategoria = !categoria || alimento.categoria === categoria;
            
            const statusAlimento = this.calcularStatus(alimento);
            const matchStatus = !status || statusAlimento.classe === status;

            return matchBusca && matchCategoria && matchStatus;
        });

        this.renderizarTabela(alimentosFiltrados);
    }

    // Abrir modal para novo alimento
    abrirModalAlimento(id = null) {
        const modal = document.getElementById('modalAlimento');
        const titulo = document.getElementById('modalTitulo');
        const form = document.getElementById('formAlimento');
        
        if (id) {
            titulo.textContent = 'Editar alimento';
            this.preencherFormulario(id);
        } else {
            titulo.textContent = 'Adicionar novo alimento';
            form.reset();
            document.getElementById('alimentoId').value = '';
        }
        
        modal.style.display = 'block';
    }

    // Preencher formulário para edição
    preencherFormulario(id) {
        const alimento = this.alimentos.find(a => a.id === id);
        if (alimento) {
            document.getElementById('alimentoId').value = alimento.id;
            document.getElementById('nome').value = alimento.nome;
            document.getElementById('categoria').value = alimento.categoria;
            document.getElementById('quantidade').value = alimento.quantidade;
            document.getElementById('unidade').value = alimento.unidade;
            document.getElementById('validade').value = alimento.validade;
            document.getElementById('estoqueMinimo').value = alimento.estoqueMinimo;
            document.getElementById('observacoes').value = alimento.observacoes || '';
        }
    }

    // Salvar alimento (novo ou editado)
    salvarAlimento(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const dados = Object.fromEntries(formData);
        const id = parseInt(document.getElementById('alimentoId').value);

        if (id) {
            // Editar alimento existente
            const index = this.alimentos.findIndex(a => a.id === id);
            if (index !== -1) {
                this.alimentos[index] = {
                    ...this.alimentos[index],
                    ...dados,
                    quantidade: parseFloat(dados.quantidade),
                    estoqueMinimo: parseFloat(dados.estoqueMinimo)
                };
            }
        } else {
            // Adicionar novo alimento
            const novoAlimento = {
                id: Date.now(),
                ...dados,
                quantidade: parseFloat(dados.quantidade),
                estoqueMinimo: parseFloat(dados.estoqueMinimo),
                dataCadastro: new Date().toISOString()
            };
            this.alimentos.push(novoAlimento);
        }

        this.salvarAlimentos();
        this.renderizarTabela();
        this.verificarAlertasVencimento();
        
        document.getElementById('modalAlimento').style.display = 'none';
        
        this.mostrarNotificacao(id ? 'Alimento atualizado com sucesso!' : 'Alimento adicionado com sucesso!');
    }

    // Editar alimento
    editarAlimento(id) {
        this.abrirModalAlimento(id);
    }

    // Excluir alimento
    excluirAlimento(id) {
        const alimento = this.alimentos.find(a => a.id === id);
        if (alimento && confirm(`Deseja realmente excluir "${alimento.nome}"?`)) {
            this.alimentos = this.alimentos.filter(a => a.id !== id);
            this.salvarAlimentos();
            this.renderizarTabela();
            this.mostrarNotificacao('Alimento excluído com sucesso!');
        }
    }

    // Abrir modal de consumo
    abrirModalConsumo(id) {
        const alimento = this.alimentos.find(a => a.id === id);
        if (!alimento) return;

        document.getElementById('consumoAlimentoId').value = id;
        document.getElementById('consumoNomeAlimento').textContent = alimento.nome;
        document.getElementById('consumoEstoqueAtual').textContent = `${alimento.quantidade} ${alimento.unidade}`;
        document.getElementById('unidadeConsumo').textContent = `Unidade: ${alimento.unidade}`;
        document.getElementById('quantidadeConsumo').max = alimento.quantidade;
        
        document.getElementById('modalConsumo').style.display = 'block';
    }

    // Registrar consumo
    registrarConsumo(e) {
        e.preventDefault();
        
        const id = parseInt(document.getElementById('consumoAlimentoId').value);
        const quantidade = parseFloat(document.getElementById('quantidadeConsumo').value);
        const data = document.getElementById('dataConsumo').value;
        const observacoes = document.getElementById('observacoesConsumo').value;

        const alimento = this.alimentos.find(a => a.id === id);
        if (!alimento) return;

        if (quantidade > alimento.quantidade) {
            alert('Quantidade de consumo não pode ser maior que o estoque disponível!');
            return;
        }

        // Atualizar estoque
        alimento.quantidade -= quantidade;
        if (alimento.quantidade < 0) alimento.quantidade = 0;

        // Registrar histórico de consumo (pode ser implementado futuramente)
        const consumo = {
            alimentoId: id,
            nomeAlimento: alimento.nome,
            quantidade: quantidade,
            unidade: alimento.unidade,
            data: data,
            observacoes: observacoes,
            timestamp: new Date().toISOString()
        };

        // Salvar histórico de consumo
        this.salvarConsumo(consumo);

        this.salvarAlimentos();
        this.renderizarTabela();
        
        document.getElementById('modalConsumo').style.display = 'none';
        document.getElementById('formConsumo').reset();
        this.configurarDataAtual();
        
        this.mostrarNotificacao(`Consumo de ${quantidade} ${alimento.unidade} registrado para ${alimento.nome}!`);
    }

    // Salvar histórico de consumo
    salvarConsumo(consumo) {
        const historico = JSON.parse(localStorage.getItem('historicoConsumo') || '[]');
        historico.push(consumo);
        localStorage.setItem('historicoConsumo', JSON.stringify(historico));
    }

    // Abrir modal de seleção para consumo rápido
    abrirModalSelecaoConsumo() {
        const modal = document.getElementById('modalSelecaoConsumo');
        this.renderizarListaConsumo();
        modal.style.display = 'block';
    }

    // Renderizar lista de alimentos para consumo rápido
    renderizarListaConsumo(alimentosFiltrados = null) {
        const lista = document.getElementById('listaAlimentosConsumo');
        const alimentos = alimentosFiltrados || this.alimentos.filter(a => a.quantidade > 0);
        
        lista.innerHTML = '';

        alimentos.forEach(alimento => {
            const item = document.createElement('div');
            item.className = 'item-alimento-consumo';
            item.onclick = () => {
                document.getElementById('modalSelecaoConsumo').style.display = 'none';
                this.abrirModalConsumo(alimento.id);
            };
            
            const status = this.calcularStatus(alimento);
            
            item.innerHTML = `
                <div class="info">
                    <div class="nome">${alimento.nome}</div>
                    <div class="detalhes">
                        ${alimento.quantidade} ${alimento.unidade} • ${this.formatarCategoria(alimento.categoria)}
                        <span class="status-badge status-${status.classe}" style="margin-left: 8px; font-size: 10px;">${status.texto}</span>
                    </div>
                </div>
                <i class="fas fa-chevron-right" style="color: #ccc;"></i>
            `;
            
            lista.appendChild(item);
        });

        if (alimentos.length === 0) {
            lista.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    Nenhum alimento disponível para consumo
                </div>
            `;
        }
    }

    // Filtrar alimentos na lista de consumo rápido
    filtrarAlimentosConsumo() {
        const busca = document.getElementById('buscaConsumoRapido').value.toLowerCase();
        const alimentosFiltrados = this.alimentos.filter(alimento => 
            alimento.quantidade > 0 && 
            (alimento.nome.toLowerCase().includes(busca) ||
             this.formatarCategoria(alimento.categoria).toLowerCase().includes(busca))
        );
        this.renderizarListaConsumo(alimentosFiltrados);
    }

    // Verificar alertas de vencimento
    verificarAlertasVencimento() {
        const hoje = new Date();
        const alimentosVencendo = this.alimentos.filter(alimento => {
            const validade = new Date(alimento.validade);
            const diasParaVencer = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
            return diasParaVencer <= 7 && diasParaVencer > 0 && alimento.quantidade > 0;
        });

        const container = document.querySelector('.alimentos-container');
        
        // Remove alertas existentes
        const alertaExistente = container.querySelector('.alerta-vencimento');
        if (alertaExistente) {
            alertaExistente.remove();
        }

        if (alimentosVencendo.length > 0) {
            const alerta = document.createElement('div');
            alerta.className = 'alerta-vencimento';
            alerta.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Atenção!</strong> 
                    ${alimentosVencendo.length} alimento(s) vencendo em até 7 dias: 
                    ${alimentosVencendo.map(a => a.nome).join(', ')}
                </div>
            `;
            
            container.insertBefore(alerta, container.firstChild);
        }
    }

    // Mostrar notificação
    mostrarNotificacao(mensagem, tipo = 'success') {
        // Criar elemento de notificação
        const notificacao = document.createElement('div');
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${tipo === 'success' ? '#4CAF50' : '#F44336'};
            color: white;
            padding: 16px 24px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        notificacao.textContent = mensagem;

        // Adicionar animação CSS
        if (!document.querySelector('#notificacao-style')) {
            const style = document.createElement('style');
            style.id = 'notificacao-style';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notificacao);

        // Remover após 3 segundos
        setTimeout(() => {
            notificacao.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notificacao.parentNode) {
                    notificacao.parentNode.removeChild(notificacao);
                }
            }, 300);
        }, 3000);
    }
}

// Função para fechar modal de consumo (usada no HTML)
function fecharModalConsumo() {
    document.getElementById('modalConsumo').style.display = 'none';
}

// Inicializar sistema quando a página carregar
let gestaoAlimentos;

document.addEventListener('DOMContentLoaded', function() {
    gestaoAlimentos = new GestaoAlimentos();
});