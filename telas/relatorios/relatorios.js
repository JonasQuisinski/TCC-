class GestaoRelatorios {
    constructor() {
        this.alimentos = [];
        this.historico = [];
        this.categorias = [];
        this.dashboard = {};
        this.consumoPeriodo = [];
        this.maisConsumidos = [];
        this.vencimentos = [];
        this.estoqueBaixo = [];
        this.charts = {};
        this.periodoAtual = 30;
        this.abaAtiva = 'categoria';
        this.init();
    }

    async init() {
        await this.carregarDados();
        this.atualizarDashboard();
        this.renderizarAbaAtiva();
        this.configurarEventos();
        this.configurarAbaClicks();
    }

    async carregarDados() {
        // Alimentos
        await fetch('../../backend/controllers/AlimentoController.php?action=listar').then(res => res.json()).then(data => {
            this.alimentos = data;

        });

        await fetch('../../backend/controllers/RelatorioController.php?action=totais')
            .then(res => res.json())
            .then(data => { this.dashboard = data; });

        await fetch('../../backend/controllers/RelatorioController.php?action=por_categoria')
            .then(res => res.json())
            .then(data => { this.categorias = data; });

        await fetch(`../../backend/controllers/RelatorioController.php?action=consumo_periodo&dias=${this.periodoAtual}`)
            .then(res => res.json())
            .then(data => { this.consumoPeriodo = data; });

        await fetch('../../backend/controllers/RelatorioController.php?action=mais_consumidos')
            .then(res => res.json())
            .then(data => { this.maisConsumidos = data; });



        await fetch('../../backend/controllers/RelatorioController.php?action=vencimentos')
            .then(res => res.json())
            .then(data => { this.vencimentos = data; });

        await fetch('../../backend/controllers/RelatorioController.php?action=estoque_baixo')
            .then(res => res.json())
            .then(data => { this.estoqueBaixo = data; });
    }
    atualizarDashboard() {
        document.getElementById('totalAlimentos').textContent = this.dashboard.totalAlimentos ?? 0;
        document.getElementById('vencendoSemana').textContent = this.dashboard.vencendoSemana ?? 0;
        document.getElementById('estoqueBaixo').textContent = this.dashboard.estoqueBaixo ?? 0;
        document.getElementById('esgotados').textContent = this.dashboard.esgotados ?? 0;
        // Atualizar alertCount
        const totalAlertas = (this.dashboard.vencendoSemana ?? 0)
            + (this.dashboard.estoqueBaixo ?? 0)
            + (this.dashboard.esgotados ?? 0);
        const alertCount = document.getElementById('alertCount');
        if (alertCount) {
            alertCount.textContent = totalAlertas;
            alertCount.style.display = totalAlertas > 0 ? 'inline' : 'none';
        }

        // Atualizar alertas de vencimentos específicos
        this.atualizarAlertasVencimentos();
    }

    atualizarAlertasVencimentos() {
        let vencendoHoje = 0, vencendo3Dias = 0, vencendo7Dias = 0;
        this.vencimentos.forEach(a => {
            const dias = a.diasRestantes;
            if (dias <= 0) vencendoHoje++;
            else if (dias <= 3) vencendo3Dias++;
            else if (dias <= 7) vencendo7Dias++;
        });
        document.getElementById('vencendoHoje').textContent = vencendoHoje;
        document.getElementById('vencendo3Dias').textContent = vencendo3Dias;
        document.getElementById('vencendo7Dias').textContent = vencendo7Dias;
    }

    // Gerenciamento de Abas
    async mudarAba(aba) {
        // Remover classe ativa das abas
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`.tab[data-aba="${aba}"]`).classList.add('active');
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        // Ativar nova aba
        document.querySelector(`[onclick="relatorios.mudarAba('${aba}')"]`).classList.add('active');
        document.getElementById(`${aba}-content`).classList.add('active');
        this.abaAtiva = aba;
        await this.carregarDados();
        await this.renderizarAbaAtiva();
    }

    async renderizarAbaAtiva() {
        switch (this.abaAtiva) {
            case 'categoria':
                this.renderizarRelatorioCategoria();
                break;
            // case 'consumo':
            //     this.renderizarRelatorioConsumo();
            //     break;
            // case 'vencimentos':
            //     this.renderizarRelatorioVencimentos();
            //     break;
            // case 'estoque':
            //     this.renderizarRelatorioEstoque();
            //     break;
        }
    }

    // Relatório por Categoria
    renderizarRelatorioCategoria() {
        this.renderizarGraficoCategoria(categorias);
        this.renderizarTabelaCategoria(categorias);

    }

    renderizarGraficoCategoria(categorias) {
        const canvas = document.getElementById('categoriaChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.charts.categoria) this.charts.categoria.destroy();
        const labels = categorias.map(cat => cat.categoria);
        const valores = categorias.map(cat => cat.itens);
        const cores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];

        this.charts.categoria = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
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
                plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } } }

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
                 <td>${categoria.categoria}</td>
                <td>${Number(categoria.quantidade).toFixed(1)} unidades</td>
                <td>${categoria.percentual}%</td>
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

        if (this.charts.consumo) this.charts.consumo.destroy();
        const labels = this.consumoPeriodo.map(item => {
            const d = new Date(item.data);
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        });
        const valores = this.consumoPeriodo.map(item => parseFloat(item.total));
        this.charts.consumo = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Consumo Diário',
                    data: valores,
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
                    y: { beginAtZero: true, title: { display: true, text: 'Quantidade Consumida' } },
                    x: { title: { display: true, text: 'Data' } }
                }
            }
        });
    }

    renderizarMaisConsumidos() {
        const lista = document.getElementById('maisConsumidos');
        if (!lista) return;

        lista.innerHTML = '';
        this.maisConsumidos.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `${item.nome}: ${parseFloat(item.total).toFixed(1)} unidades`;
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

        tbody.innerHTML = '';
        this.vencimentos.forEach(alimento => {
            const row = document.createElement('tr');
            const statusClass = alimento.diasRestantes <= 0 ? 'vencido' :
                alimento.diasRestantes <= 3 ? 'urgente' : 'alerta';

            row.className = statusClass;
            row.innerHTML = `
                <td>${alimento.nome}</td>
                <td>${alimento.categoria}</td>
                <td>${alimento.quantidade} ${alimento.unidade}</td>
                <td>${new Date(alimento.validade).toLocaleDateString('pt-BR')}</td>
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
        if (this.charts.estoque) this.charts.estoque.destroy();

        const labels = this.alimentos.map(alimento => alimento.nome);
        const valores = this.alimentos.map(alimento => parseFloat(alimento.quantidade));
        const cores = this.alimentos.map(alimento => {
            if (parseFloat(alimento.quantidade) === 0) return '#FF6384'; // Esgotado
            if (parseFloat(alimento.quantidade) <= parseFloat(alimento.estoque_minimo ?? alimento.estoqueMinimo))
                return '#4BC0C0'; // Normal
        });

        this.charts.estoque = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
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
                    y: { beginAtZero: true, title: { display: true, text: 'Quantidade' } }

                }
            }
        });
    }

    renderizarTabelaEstoque() {
        const tbody = document.querySelector('#estoqueTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.estoqueBaixo.forEach(alimento => {
            const row = document.createElement('tr');
            const sugestaoCompra = Math.max(0, parseFloat(alimento.sugestaoCompra));
            const statusClass = parseFloat(alimento.quantidade) === 0 ? 'esgotado' : 'baixo';

            row.className = statusClass;
            row.innerHTML = `
                <td>${alimento.nome}</td>
                <td>${alimento.categoria}</td>
                <td>${alimento.quantidade} ${alimento.unidade}</td>
                <td>${alimento.estoque_minimo ?? alimento.estoqueMinimo} ${alimento.unidade}</td>
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
            periodoConsumo.addEventListener('change', async (e) => {
                this.periodoAtual = parseInt(e.target.value);
                await this.carregarDados();
                if (this.abaAtiva === 'consumo') {
                    await this.renderizarRelatorioConsumo();
                }
            });
        }
        setInterval(async () => {
            await this.carregarDados();
            this.atualizarDashboard();
            await this.renderizarAbaAtiva();
        }, 60000); // A cada minuto
    }

    configurarAbaClicks() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', async (e) => {
                const aba = tab.getAttribute('data-aba');
                await this.mudarAba(aba);
            });
        });
    }
    exportarRelatorio(tipo) {
        this.mostrarLoading();

        setTimeout(() => {
            if (tipo === 'pdf') this.exportarPDF();
            else if (tipo === 'excel') this.exportarExcel();
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
        return {
            alimentos: this.alimentos,
            categorias: this.categorias,
            vencimentos: this.vencimentos,
            estoqueBaixo: this.estoqueBaixo,
            estatisticas: this.dashboard,
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
            csv += `${alimento.nome},${alimento.categoria},${alimento.quantidade},${alimento.unidade},${alimento.validade},${alimento.estoque_minimo ?? alimento.estoqueMinimo}\n`;
        });

        csv += '\n';

        // Categorias
        csv += 'DISTRIBUIÇÃO POR CATEGORIA\n';
        csv += 'Categoria,Quantidade,Percentual\n';
        Object.values(dados.categorias).forEach(categoria => {
            csv += `${categoria.categoria},${categoria.quantidade},${categoria.percentual}%\n`;
        });

        return csv;
    }

    baixarArquivo(conteudo, nomeArquivo, tipo) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click(); setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(a.href);
        }, 100);
    }

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
}



document.addEventListener('DOMContentLoaded', () => {
    window.relatorios = new GestaoRelatorios();
});
