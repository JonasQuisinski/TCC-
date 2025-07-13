class GestaoRelatorios {
    constructor() {
        this.alimentos = [];
        this.historico = [];
        this.charts = {};
        this.periodoAtual = 30;
        this.abaAtiva = 'categoria';
        this.init();
    }

    init() {
        this.carregarDados();
        this.atualizarDashboard();
        this.renderizarAbaAtiva();
        this.configurarEventos();
    }
// Alterar essa jabirosca depois v
    carregarDados() {
        // Carregar alimentos 
        const alimentosStorage = localStorage.getItem('alimentos');
        this.alimentos = alimentosStorage ? JSON.parse(alimentosStorage) : this.gerarDadosExemplo();

        // Carregar histórico de consumo
        const historicoStorage = localStorage.getItem('historicoConsumo');
        this.historico = historicoStorage ? JSON.parse(historicoStorage) : this.gerarHistoricoExemplo();

        // Salvar dados 
        if (!alimentosStorage) {
            localStorage.setItem('alimentos', JSON.stringify(this.alimentos));
        }
        if (!historicoStorage) {
            localStorage.setItem('historicoConsumo', JSON.stringify(this.historico));
        }
    }

    gerarDadosExemplo() {
        return [
            { id: 1, nome: 'Arroz', categoria: 'Grãos', quantidade: 5, unidade: 'kg', validade: '2025-08-15', estoqueMinimo: 2, observacoes: '', dataCadastro: '2025-07-01' },
            { id: 2, nome: 'Feijão', categoria: 'Grãos', quantidade: 3, unidade: 'kg', validade: '2025-08-20', estoqueMinimo: 1, observacoes: '', dataCadastro: '2025-07-02' },
            { id: 3, nome: 'Leite', categoria: 'Laticínios', quantidade: 0, unidade: 'l', validade: '2025-07-10', estoqueMinimo: 2, observacoes: '', dataCadastro: '2025-07-03' },
            { id: 4, nome: 'Banana', categoria: 'Frutas', quantidade: 2, unidade: 'kg', validade: '2025-07-16', estoqueMinimo: 1, observacoes: '', dataCadastro: '2025-07-04' },
            { id: 5, nome: 'Tomate', categoria: 'Vegetais', quantidade: 1, unidade: 'kg', validade: '2025-07-17', estoqueMinimo: 1, observacoes: '', dataCadastro: '2025-07-05' },
            { id: 6, nome: 'Frango', categoria: 'Carnes', quantidade: 1, unidade: 'kg', validade: '2025-07-18', estoqueMinimo: 2, observacoes: '', dataCadastro: '2025-07-06' },
            { id: 7, nome: 'Refrigerante', categoria: 'Bebidas', quantidade: 6, unidade: 'l', validade: '2025-09-01', estoqueMinimo: 3, observacoes: '', dataCadastro: '2025-07-07' },
            { id: 8, nome: 'Sal', categoria: 'Temperos', quantidade: 0.5, unidade: 'kg', validade: '2026-01-01', estoqueMinimo: 0.3, observacoes: '', dataCadastro: '2025-07-08' },
            { id: 9, nome: 'Açúcar', categoria: 'Temperos', quantidade: 0, unidade: 'kg', validade: '2025-07-14', estoqueMinimo: 1, observacoes: '', dataCadastro: '2025-07-09' },
            { id: 10, nome: 'Batata', categoria: 'Vegetais', quantidade: 3, unidade: 'kg', validade: '2025-07-15', estoqueMinimo: 2, observacoes: '', dataCadastro: '2025-07-10' }
        ];
    }

    gerarHistoricoExemplo() {
        const hoje = new Date();
        const historico = [];

        for (let i = 0; i < 30; i++) {
            const data = new Date(hoje);
            data.setDate(hoje.getDate() - i);

            if (Math.random() > 0.3) {
                const numConsumosHoje = Math.floor(Math.random() * 3) + 1;

                for (let j = 0; j < numConsumosHoje; j++) {
                    const alimento = this.alimentos[Math.floor(Math.random() * this.alimentos.length)];
                    const quantidade = Math.random() * 2 + 0.5;
                    historico.push({
                        alimentoId: alimento.id,
                        nomeAlimento: alimento.nome,
                        categoria: alimento.categoria,
                        quantidade: quantidade,
                        unidade: alimento.unidade,
                        data: data.toISOString().split('T')[0],
                        observacoes: '',
                        timestamp: data.getTime()
                    });
                }
            }
        }

        return historico;
    }

    atualizarDashboard() {
        const hoje = new Date();
        const semanaProxima = new Date(hoje);
        semanaProxima.setDate(hoje.getDate() + 7);

        // Total de alimentos
        const totalAlimentos = this.alimentos.length;
        document.getElementById('totalAlimentos').textContent = totalAlimentos;

        // Alimentos vencendo em 7 dias
        const vencendoSemana = this.alimentos.filter(alimento => {
            const vencimento = new Date(alimento.validade);
            return vencimento <= semanaProxima && vencimento >= hoje;
        }).length;
        document.getElementById('vencendoSemana').textContent = vencendoSemana;

        // Estoque baixo
        const estoqueBaixo = this.alimentos.filter(alimento =>
            alimento.quantidade <= alimento.estoqueMinimo && alimento.quantidade > 0
        ).length;
        document.getElementById('estoqueBaixo').textContent = estoqueBaixo;

        // Esgotados
        const esgotados = this.alimentos.filter(alimento => alimento.quantidade === 0).length;
        document.getElementById('esgotados').textContent = esgotados;

        // Atualizar cor alertas
        const totalAlertas = vencendoSemana + estoqueBaixo + esgotados;
        const alertCount = document.getElementById('alertCount');
        if (alertCount) {
            alertCount.textContent = totalAlertas;
            alertCount.style.display = totalAlertas > 0 ? 'inline' : 'none';
        }

        // Atualizar alertas de vencimentos específicos
        this.atualizarAlertasVencimentos();
    }

    atualizarAlertasVencimentos() {
        const hoje = new Date();

        // Vencendo hoje
        const vencendoHoje = this.alimentos.filter(alimento => {
            const vencimento = new Date(alimento.validade);
            return vencimento.toDateString() === hoje.toDateString();
        }).length;

        // Vencendo em 3 dias
        const data3Dias = new Date(hoje);
        data3Dias.setDate(hoje.getDate() + 3);
        const vencendo3Dias = this.alimentos.filter(alimento => {
            const vencimento = new Date(alimento.validade);
            return vencimento <= data3Dias && vencimento >= hoje;
        }).length;

        // Vencendo em 7 dias
        const data7Dias = new Date(hoje);
        data7Dias.setDate(hoje.getDate() + 7);
        const vencendo7Dias = this.alimentos.filter(alimento => {
            const vencimento = new Date(alimento.validade);
            return vencimento <= data7Dias && vencimento >= hoje;
        }).length;

        // Atualizar elementos se existirem
        const elemVencendoHoje = document.getElementById('vencendoHoje');
        const elemVencendo3Dias = document.getElementById('vencendo3Dias');
        const elemVencendo7Dias = document.getElementById('vencendo7Dias');

        if (elemVencendoHoje) elemVencendoHoje.textContent = vencendoHoje;
        if (elemVencendo3Dias) elemVencendo3Dias.textContent = vencendo3Dias;
        if (elemVencendo7Dias) elemVencendo7Dias.textContent = vencendo7Dias;
    }

    // Gerenciamento de Abas
    mudarAba(aba) {
        // Remover classe ativa das abas
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        // Ativar nova aba
        document.querySelector(`[onclick="relatorios.mudarAba('${aba}')"]`).classList.add('active');
        document.getElementById(`${aba}-content`).classList.add('active');

        this.abaAtiva = aba;
        this.renderizarAbaAtiva();
    }

    renderizarAbaAtiva() {
        switch (this.abaAtiva) {
            case 'categoria':
                this.renderizarRelatorioCategoria();
                break;
            case 'consumo':
                this.renderizarRelatorioConsumo();
                break;
            case 'vencimentos':
                this.renderizarRelatorioVencimentos();
                break;
            case 'estoque':
                this.renderizarRelatorioEstoque();
                break;
        }
    }

    // Relatório por Categoria
    renderizarRelatorioCategoria() {
        const categorias = this.calcularDadosCategoria();
        this.renderizarGraficoCategoria(categorias);
        this.renderizarTabelaCategoria(categorias);
    }

    calcularDadosCategoria() {
        const categorias = {};

        this.alimentos.forEach(alimento => {
            const categoria = alimento.categoria;
            if (!categorias[categoria]) {
                categorias[categoria] = {
                    nome: categoria,
                    quantidade: 0,
                    itens: 0
                };
            }
            categorias[categoria].quantidade += alimento.quantidade;
            categorias[categoria].itens += 1;
        });

        // Calcular percentuais
        const totalItens = Object.values(categorias).reduce((sum, cat) => sum + cat.itens, 0);
        Object.keys(categorias).forEach(key => {
            categorias[key].percentual = totalItens > 0 ? (categorias[key].itens / totalItens * 100).toFixed(1) : 0;
        });

        return categorias;
    }

    renderizarGraficoCategoria(categorias) {
        const canvas = document.getElementById('categoriaChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.charts.categoria) {
            this.charts.categoria.destroy();
        }

        const dados = Object.values(categorias);
        const labels = dados.map(cat => cat.nome);
        const valores = dados.map(cat => cat.itens);
        const cores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];

        this.charts.categoria = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: cores.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    renderizarTabelaCategoria(categorias) {
        const tbody = document.querySelector('#categoriaTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        Object.entries(categorias).forEach(([key, categoria]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${categoria.nome}</td>
                <td>${categoria.quantidade.toFixed(1)} unidades</td>
                <td>${categoria.percentual}%</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Relatório Consumo
    renderizarRelatorioConsumo() {
        this.renderizarGraficoConsumo();
        this.renderizarMaisConsumidos();
    }

    renderizarGraficoConsumo() {
        const canvas = document.getElementById('consumoChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.charts.consumo) {
            this.charts.consumo.destroy();
        }

        const dadosConsumo = this.calcularConsumoTempo();

        this.charts.consumo = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dadosConsumo.labels,
                datasets: [{
                    label: 'Consumo Diário',
                    data: dadosConsumo.valores,
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade Consumida'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Data'
                        }
                    }
                }
            }
        });
    }

    calcularConsumoTempo() {
        const hoje = new Date();
        const periodo = parseInt(document.getElementById('periodoConsumo')?.value || this.periodoAtual);
        const labels = [];
        const valores = [];

        for (let i = periodo - 1; i >= 0; i--) {
            const data = new Date(hoje);
            data.setDate(hoje.getDate() - i);
            const dataStr = data.toISOString().split('T')[0];

            labels.push(data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));

            const consumoDoDia = this.historico
                .filter(item => item.data === dataStr)
                .reduce((sum, item) => sum + item.quantidade, 0);

            valores.push(consumoDoDia.toFixed(1));
        }

        return { labels, valores };
    }

    renderizarMaisConsumidos() {
        const lista = document.getElementById('maisConsumidos');
        if (!lista) return;

        // Calc consumo por alimento
        const consumoPorAlimento = {};
        this.historico.forEach(item => {
            if (!consumoPorAlimento[item.nomeAlimento]) {
                consumoPorAlimento[item.nomeAlimento] = 0;
            }
            consumoPorAlimento[item.nomeAlimento] += item.quantidade;
        });

        // Ordenar por consumo
        const maisConsumidos = Object.entries(consumoPorAlimento)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        lista.innerHTML = '';
        maisConsumidos.forEach(([nome, quantidade]) => {
            const li = document.createElement('li');
            li.innerHTML = `${nome}: ${quantidade.toFixed(1)} unidades`;
            lista.appendChild(li);
        });
    }

    // Relatório Vencimentos
    renderizarRelatorioVencimentos() {
        this.renderizarTabelaVencimentos();
    }

    renderizarTabelaVencimentos() {
        const tbody = document.querySelector('#vencimentosTable tbody');
        if (!tbody) return;

        const hoje = new Date();
        const alimentosVencimento = this.alimentos
            .map(alimento => {
                const vencimento = new Date(alimento.validade);
                const diasRestantes = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
                return { ...alimento, diasRestantes, vencimento };
            })
            .filter(alimento => alimento.diasRestantes <= 30)
            .sort((a, b) => a.diasRestantes - b.diasRestantes);

        tbody.innerHTML = '';
        alimentosVencimento.forEach(alimento => {
            const row = document.createElement('tr');
            const statusClass = alimento.diasRestantes <= 0 ? 'vencido' :
                alimento.diasRestantes <= 3 ? 'urgente' : 'alerta';

            row.className = statusClass;
            row.innerHTML = `
                <td>${alimento.nome}</td>
                <td>${alimento.categoria}</td>
                <td>${alimento.quantidade} ${alimento.unidade}</td>
                <td>${alimento.vencimento.toLocaleDateString('pt-BR')}</td>
                <td>${alimento.diasRestantes <= 0 ? 'Vencido' : `${alimento.diasRestantes} dias`}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Relatório Estoque
    renderizarRelatorioEstoque() {
        this.renderizarGraficoEstoque();
        this.renderizarTabelaEstoque();
    }

    renderizarGraficoEstoque() {
        const canvas = document.getElementById('estoqueChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.charts.estoque) {
            this.charts.estoque.destroy();
        }

        const labels = this.alimentos.map(alimento => alimento.nome);
        const valores = this.alimentos.map(alimento => alimento.quantidade);
        const cores = this.alimentos.map(alimento => {
            if (alimento.quantidade === 0) return '#FF6384'; // Esgotado
            if (alimento.quantidade <= alimento.estoqueMinimo) return '#FFCE56'; // Baixo
            return '#4BC0C0'; // Normal
        });

        this.charts.estoque = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade em Estoque',
                    data: valores,
                    backgroundColor: cores,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade'
                        }
                    }
                }
            }
        });
    }

    renderizarTabelaEstoque() {
        const tbody = document.querySelector('#estoqueTable tbody');
        if (!tbody) return;

        const estoqueBaixo = this.alimentos.filter(alimento =>
            alimento.quantidade <= alimento.estoqueMinimo
        );

        tbody.innerHTML = '';
        estoqueBaixo.forEach(alimento => {
            const row = document.createElement('tr');
            const sugestaoCompra = Math.max(0, alimento.estoqueMinimo * 2 - alimento.quantidade);
            const statusClass = alimento.quantidade === 0 ? 'esgotado' : 'baixo';

            row.className = statusClass;
            row.innerHTML = `
                <td>${alimento.nome}</td>
                <td>${alimento.categoria}</td>
                <td>${alimento.quantidade} ${alimento.unidade}</td>
                <td>${alimento.estoqueMinimo} ${alimento.unidade}</td>
                <td>${sugestaoCompra.toFixed(1)} ${alimento.unidade}</td>
            `;
            tbody.appendChild(row);
        });
    }

    //Eventos
    configurarEventos() {
        // Filtro de período
        const periodoConsumo = document.getElementById('periodoConsumo');
        if (periodoConsumo) {
            periodoConsumo.addEventListener('change', (e) => {
                this.periodoAtual = parseInt(e.target.value);
                if (this.abaAtiva === 'consumo') {
                    this.renderizarRelatorioConsumo();
                }
            });
        }

        // Atualização auto
        setInterval(() => {
            this.carregarDados();
            this.atualizarDashboard();
            this.renderizarAbaAtiva();
        }, 60000); // A cada minuto
    }

    // Exporta de Relatórios
    exportarRelatorio(tipo) {
        this.mostrarLoading();

        setTimeout(() => {
            if (tipo === 'pdf') {
                this.exportarPDF();
            } else if (tipo === 'excel') {
                this.exportarExcel();
            }
            this.ocultarLoading();
        }, 1000);
    }

    exportarPDF() {
        window.print();
    }

    exportarExcel() {
        const dados = this.prepararDadosExportacao();
        const csv = this.converterParaCSV(dados);
        this.baixarArquivo(csv, 'relatorio-despensa.csv', 'text/csv');
    }

    prepararDadosExportacao() {
        const categorias = this.calcularDadosCategoria();
        const hoje = new Date();

        return {
            alimentos: this.alimentos,
            categorias: categorias,
            vencimentos: this.alimentos.map(alimento => {
                const vencimento = new Date(alimento.validade);
                const diasRestantes = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
                return { ...alimento, diasRestantes };
            }).filter(a => a.diasRestantes <= 30),
            estoqueBaixo: this.alimentos.filter(a => a.quantidade <= a.estoqueMinimo),
            estatisticas: {
                totalAlimentos: this.alimentos.length,
                vencendoSemana: this.alimentos.filter(a => {
                    const vencimento = new Date(a.validade);
                    const semanaProxima = new Date(hoje);
                    semanaProxima.setDate(hoje.getDate() + 7);
                    return vencimento <= semanaProxima;
                }).length,
                estoqueBaixo: this.alimentos.filter(a => a.quantidade <= a.estoqueMinimo).length,
                esgotados: this.alimentos.filter(a => a.quantidade === 0).length
            }
        };
    }

    converterParaCSV(dados) {
        let csv = 'RELATÓRIO DA DESPENSA\n';
        csv += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;

        // Estatísticas
        csv += 'ESTATÍSTICAS GERAIS\n';
        csv += `Total de Alimentos,${dados.estatisticas.totalAlimentos}\n`;
        csv += `Vencendo em 7 dias,${dados.estatisticas.vencendoSemana}\n`;
        csv += `Estoque Baixo,${dados.estatisticas.estoqueBaixo}\n`;
        csv += `Esgotados,${dados.estatisticas.esgotados}\n\n`;

        // Alimentos
        csv += 'TODOS OS ALIMENTOS\n';
        csv += 'Nome,Categoria,Quantidade,Unidade,Validade,Estoque Mínimo\n';
        dados.alimentos.forEach(alimento => {
            csv += `${alimento.nome},${alimento.categoria},${alimento.quantidade},${alimento.unidade},${alimento.validade},${alimento.estoqueMinimo}\n`;
        });

        csv += '\n';

        // Categorias
        csv += 'DISTRIBUIÇÃO POR CATEGORIA\n';
        csv += 'Categoria,Quantidade,Percentual\n';
        Object.values(dados.categorias).forEach(categoria => {
            csv += `${categoria.nome},${categoria.quantidade},${categoria.percentual}%\n`;
        });

        return csv;
    }

    baixarArquivo(conteudo, nomeArquivo, tipo) {
        const blob = new Blob([conteudo], { type: tipo });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Utilitários de Interface
    mostrarLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) loading.style.display = 'flex';
    }

    ocultarLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) loading.style.display = 'none';
    }

    fecharModal() {
        const modal = document.getElementById('detailModal');
        if (modal) modal.style.display = 'none';
    }

    // Atualizar tudo
    atualizarTudo() {
        this.carregarDados();
        this.atualizarDashboard();
        this.renderizarAbaAtiva();
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.relatorios = new GestaoRelatorios();
});

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestaoRelatorios;
}