class GestaoRelatorios {
    constructor() {
        this.alimentos = [];
        this.historico = [];
        this.categorias = [];
        this.dashboard = {};
        this.consumoPeriodo = [];
        this.consumoDetalhado = [];
        this.maisConsumidos = [];
        this.vencimentos = [];
        this.estoqueBaixo = [];
        this.charts = {};
        const select = document ? document.getElementById('periodoConsumo') : null;
        this.periodoAtual = select ? parseInt(select.value, 10) || 30 : 30;
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
        try {
            const resAl = await fetch('../../backend/controllers/AlimentoController.php?action=listar', { credentials: 'include' });
            if (resAl.ok) this.alimentos = await resAl.json();
        } catch (e) { console.error('Erro ao carregar alimentos', e); }

        try {
            const resTot = await fetch('../../backend/controllers/RelatorioController.php?action=totais', { credentials: 'include' });
            if (resTot.ok) this.dashboard = await resTot.json();
        } catch (e) { console.error('Erro ao carregar totais', e); }

        try {
            const resCat = await fetch('../../backend/controllers/RelatorioController.php?action=por_categoria', { credentials: 'include' });
            if (resCat.ok) this.categorias = await resCat.json();
        } catch (e) { console.error('Erro ao carregar categorias', e); }

        try {
            const resCons = await fetch(`../../backend/controllers/RelatorioController.php?action=consumo_periodo&dias=${this.periodoAtual}`, { credentials: 'include' });
            if (resCons.ok) this.consumoPeriodo = await resCons.json();
            else { console.error('Erro na resposta consumo_periodo', resCons.status); this.consumoPeriodo = []; }
        } catch (e) { console.error('Erro ao carregar consumo_periodo', e); this.consumoPeriodo = []; }

        try {
            const resConsDet = await fetch(`../../backend/controllers/RelatorioController.php?action=consumo_detalhado&dias=${this.periodoAtual}`, { credentials: 'include' });
            if (resConsDet.ok) this.consumoDetalhado = await resConsDet.json();
            else this.consumoDetalhado = [];
        } catch (e) { console.error('Erro consumo_detalhado', e); this.consumoDetalhado = []; }

        try {
            const resMais = await fetch('../../backend/controllers/RelatorioController.php?action=mais_consumidos', { credentials: 'include' });
            if (resMais.ok) this.maisConsumidos = await resMais.json();
        } catch (e) { console.error('Erro ao carregar mais_consumidos', e); }

        try {
            const resVen = await fetch('../../backend/controllers/RelatorioController.php?action=vencimentos', { credentials: 'include' });
            if (resVen.ok) this.vencimentos = await resVen.json();
        } catch (e) { console.error('Erro ao carregar vencimentos', e); }

        try {
            const resEst = await fetch('../../backend/controllers/RelatorioController.php?action=estoque_baixo', { credentials: 'include' });
            if (resEst.ok) this.estoqueBaixo = await resEst.json();
        } catch (e) { console.error('Erro ao carregar estoque_baixo', e); }
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
        const tabEl = document.querySelector(`.tab[data-aba="${aba}"]`);
        if (tabEl) tabEl.classList.add('active');
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        const paneBtn = document.querySelector(`[onclick="relatorios.mudarAba('${aba}')"]`);
        if (paneBtn) paneBtn.classList.add('active');
        const content = document.getElementById(`${aba}-content`);
        if (content) content.classList.add('active');

        this.abaAtiva = aba;
        await this.carregarDados();
        await this.renderizarAbaAtiva();
    }

    async renderizarAbaAtiva() {
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
        this.renderizarGraficoCategoria(this.categorias);
        this.renderizarTabelaCategoria(this.categorias);

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
              
            `;
            tbody.appendChild(row);
        });
    }

    // Relatório Consumo
    renderizarRelatorioConsumo() {
        this.renderizarGraficoConsumo();
        this.renderizarMaisConsumidos(this.maisConsumidos);
    }

    renderizarGraficoConsumo(data = this.consumoPeriodo) {
        const canvas = document.getElementById('consumoChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.charts.consumo) this.charts.consumo.destroy();

        // Normalizar dados: chave YYYY-MM-DD -> total
        const totalsByDate = {};
        if (Array.isArray(data)) {
            data.forEach(item => {
                // item.data deve vir no formato YYYY-MM-DD (veja backend)
                const dateKey = (item.data || '').split(' ')[0];
                totalsByDate[dateKey] = parseFloat(item.total) || 0;
            });
        }

        // Gerar labels e valores contínuos para o período atual
        const labels = [];
        const valores = [];
        for (let i = this.periodoAtual - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const isoKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
            labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            valores.push(totalsByDate[isoKey] ?? 0);
        }

        this.charts.consumo = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Consumo Diário',
                    data: valores,
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: false,
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
        this.renderizarTabelaVencimentos(this.vencimentos);
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
        this.renderizarGraficoEstoque(this.estoqueBaixo);
        this.renderizarTabelaEstoque(this.estoqueBaixo);
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
                return '#FFCE56'; // Abaixo do mínimo: destaque
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
            const estoque_minimo = parseFloat(alimento.estoque_minimo ?? alimento.estoqueMinimo);
            const statusClass = parseFloat(alimento.quantidade) === 0 ? 'esgotado' : 'baixo';

            row.className = statusClass;
            row.innerHTML = `
                <td>${alimento.nome}</td>
                <td>${alimento.categoria}</td>
                <td>${alimento.quantidade} ${alimento.unidade}</td>
                <td>2</td>
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

    async exportarPDF() {
    // Cria um container temporário que conterá todas as abas para o PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.style.padding = '12px';
    pdfContainer.style.fontFamily = 'DejaVu Sans, sans-serif';
    pdfContainer.style.color = '#222';

    // Header do PDF
    const header = document.createElement('div');
    header.innerHTML = `<h1>Relatório da Despensa</h1><p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p><hr/>`;
    pdfContainer.appendChild(header);

    // Abas que queremos exportar (id das panes no HTML)
    const tabs = [
        { id: 'categoria', title: 'Distribuição por Categoria' },
        { id: 'consumo', title: 'Consumo por Período' },
        { id: 'vencimentos', title: 'Próximos Vencimentos' },
        { id: 'estoque', title: 'Status do Estoque' }
    ];

    // Função que clona um pane e substitui canvases por imagens (a partir do canvas original)
    const clonePaneWithCanvases = (paneEl) => {
        const clone = paneEl.cloneNode(true);
        const originalCanvases = paneEl.querySelectorAll('canvas');

        originalCanvases.forEach((origCanvas, idx) => {
            try {
                const dataUrl = origCanvas.toDataURL('image/png');
                // localizar o canvas correspondente no clone (por index)
                const clonedCanvases = clone.querySelectorAll('canvas');
                const clonedCanvas = clonedCanvases[idx];
                if (clonedCanvas && clonedCanvas.parentNode) {
                    const img = document.createElement('img');
                    img.src = dataUrl;
                    img.style.maxWidth = '100%';
                    img.style.display = 'block';
                    clonedCanvas.parentNode.replaceChild(img, clonedCanvas);
                }
            } catch (e) {
                // fallback: se toDataURL falhar (ex: cross-origin), apenas remove o canvas no clone
                const clonedCanvases = clone.querySelectorAll('canvas');
                const clonedCanvas = clonedCanvases[idx];
                if (clonedCanvas && clonedCanvas.parentNode) {
                    clonedCanvas.parentNode.removeChild(clonedCanvas);
                }
            }
        });
        return clone;
    };

    // Monta cada seção (aba) no container do PDF
    for (const t of tabs) {
        const section = document.createElement('section');
        section.style.marginBottom = '18px';
        section.innerHTML = `<h2>${t.title}</h2>`;

        const pane = document.getElementById(`${t.id}-content`);
        if (pane) {
            const cloned = clonePaneWithCanvases(pane);
            section.appendChild(cloned);

            // Se for aba consumo, adiciona tabela detalhada com motivos (se existir this.consumoDetalhado)
            if (t.id === 'consumo') {
                if (Array.isArray(this.consumoDetalhado) && this.consumoDetalhado.length > 0) {
                    const table = document.createElement('table');
                    table.style.width = '100%';
                    table.style.borderCollapse = 'collapse';
                    table.innerHTML = `<thead>
                        <tr>
                            <th style="border:1px solid #ccc;padding:6px">Data</th>
                            <th style="border:1px solid #ccc;padding:6px">Alimento</th>
                            <th style="border:1px solid #ccc;padding:6px">Quantidade</th>
                            <th style="border:1px solid #ccc;padding:6px">Motivo</th>
                        </tr>
                    </thead>`;
                    const tbody = document.createElement('tbody');
                    this.consumoDetalhado.forEach(row => {
                        const tr = document.createElement('tr');
                        const dt = row.data ? (new Date(row.data)).toLocaleDateString('pt-BR') : '';
                        const nome = row.alimento ?? '';
                        const q = row.quantidade ?? '';
                        const motivo = row.motivo ?? '';
                        tr.innerHTML = `<td style="border:1px solid #ccc;padding:6px">${dt}</td>
                                        <td style="border:1px solid #ccc;padding:6px">${nome}</td>
                                        <td style="border:1px solid #ccc;padding:6px">${q}</td>
                                        <td style="border:1px solid #ccc;padding:6px">${motivo}</td>`;
                        tbody.appendChild(tr);
                    });
                    table.appendChild(tbody);
                    section.appendChild(table);
                } else {
                    const p = document.createElement('p');
                    p.textContent = 'Nenhum registro detalhado de consumo encontrado para o período.';
                    section.appendChild(p);
                }
            }
        } else {
            section.appendChild(document.createTextNode('Conteúdo não encontrado.'));
        }
        pdfContainer.appendChild(section);
    }

    // Opções do html2pdf
    const now = new Date();
    const filename = `relatorio-despensa-${now.toISOString().slice(0,10)}.pdf`;
    const opt = {
        margin: 0.4,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // Mostrar loading e gerar
    this.mostrarLoading();
    try {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        await html2pdf().set(opt).from(pdfContainer).save();
    } catch (err) {
        console.error('Erro ao gerar PDF com html2pdf:', err);
        alert('Erro ao gerar PDF. Veja o console para detalhes.');
    } finally {
        this.ocultarLoading();
    }
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