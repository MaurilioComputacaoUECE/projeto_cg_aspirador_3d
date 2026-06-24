class AppController {
    constructor() {
        this.stats = new StatsStore();
        this.cena3D = null;
        this.cacheElements();
        this.bindEvents();
        this.showScreen('main');
        this.renderStats();
    }

    cacheElements() {
        this.menuPanel = document.getElementById('menu-panel');
        this.canvas = document.getElementById('glcanvas1');
        this.hud = document.getElementById('hud');
        this.batchProgress = document.getElementById('batch-progress');
        this.batchResult = document.getElementById('batch-result');
        this.statsTable = document.getElementById('stats-table');
    }

    bindEvents() {
        document.getElementById('btn-visual').addEventListener('click', () => this.showScreen('visual'));
        document.getElementById('btn-lote').addEventListener('click', () => this.showScreen('lote'));
        document.getElementById('btn-start-visual').addEventListener('click', () => this.iniciarVisual());
        document.getElementById('btn-run-batch').addEventListener('click', () => this.executarLote());

        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => this.showScreen('main'));
        });
    }

    showScreen(name) {
        document.querySelectorAll('.menu-screen').forEach(el => el.classList.remove('active'));
        const screen = document.getElementById(`menu-${name}`);
        if (screen) screen.classList.add('active');

        this.menuPanel.classList.remove('hidden');
        this.canvas.classList.add('hidden');
        this.hud.classList.add('hidden');
        this.batchProgress.textContent = '';
        this.batchResult.textContent = '';
    }

    getTamanho() {
        const loteAtivo = document.getElementById('menu-lote').classList.contains('active');
        const el = loteAtivo
            ? document.getElementById('input-tamanho-lote')
            : document.getElementById('input-tamanho');
        const val = parseInt(el.value, 10);
        return Math.max(5, Math.min(12, val || 8));
    }

    iniciarVisual() {
        const agenteTipo = document.getElementById('visual-agente').value;
        const tamanho = this.getTamanho();

        const simulador = new Simulador({ tamanho, agenteTipo, maxPassos: 500 });
        simulador.executarVisual();

        this.menuPanel.classList.add('hidden');
        this.canvas.classList.remove('hidden');
        this.hud.classList.remove('hidden');

        this.cena3D = new AspiradorScene3D('glcanvas1', simulador, {
            onFinish: (resultado) => this.finalizarVisual(agenteTipo, resultado)
        });
        this.cena3D.iniciar();
    }

    finalizarVisual(tipo, resultado) {
        if (resultado) {
            const stats = {
                total: 1,
                taxaSucesso: resultado.sucesso ? 100 : 0,
                pontuacao: { media: resultado.pontuacao, min: resultado.pontuacao, max: resultado.pontuacao },
                passos: { media: resultado.passos, min: resultado.passos, max: resultado.passos }
            };
            this.stats.registrarVisual(tipo, stats);
        }

        this.cena3D = null;
        this.showScreen('main');
        this.renderStats();

        if (resultado) {
            alert(
                `Simulacao encerrada!\n` +
                `Agente: ${StatsStore.getLabel(tipo)}\n` +
                `Passos: ${resultado.passos}\n` +
                `Pontuacao: ${resultado.pontuacao}\n` +
                `Sucesso: ${resultado.sucesso ? 'Sim' : 'Nao'}`
            );
        }
    }

    async executarLote() {
        const tamanho = this.getTamanho();
        const config = {
            tamanho,
            maxPassos: 500,
            reativo: parseInt(document.getElementById('lote-reativo').value, 10) || 0,
            modelo: parseInt(document.getElementById('lote-modelo').value, 10) || 0,
            onisciente: parseInt(document.getElementById('lote-onisciente').value, 10) || 0
        };

        const total = config.reativo + config.modelo + config.onisciente;
        if (total <= 0) {
            alert('Informe pelo menos uma simulacao para algum agente.');
            return;
        }

        const btn = document.getElementById('btn-run-batch');
        btn.disabled = true;
        this.batchProgress.textContent = 'Executando... 0%';
        this.batchResult.textContent = '';

        const simulador = new Simulador(config);
        simulador.onProgresso((atual, totalGeral, tipo) => {
            const pct = Math.round((atual / totalGeral) * 100);
            this.batchProgress.textContent =
                `Executando ${StatsStore.getLabel(tipo)}... ${atual}/${totalGeral} (${pct}%)`;
        });

        await new Promise(resolve => {
            setTimeout(() => {
                const resultados = simulador.executarBatchMulti(config);
                this.stats.registrarBatch(resultados);
                this.renderStats();
                this.mostrarResultadoLote(resultados);
                btn.disabled = false;
                resolve();
            }, 50);
        });
    }

    mostrarResultadoLote(resultados) {
        let html = '<h4>Resultado desta execucao</h4><ul>';
        for (const [tipo, stats] of Object.entries(resultados)) {
            html += `<li><strong>${StatsStore.getLabel(tipo)}</strong> (${stats.total} runs): ` +
                `pontuacao media ${stats.pontuacao.media.toFixed(1)}, ` +
                `sucesso ${stats.taxaSucesso.toFixed(0)}%, ` +
                `passos ${stats.passos.media.toFixed(0)}</li>`;
        }
        html += '</ul>';
        this.batchResult.innerHTML = html;
        this.batchProgress.textContent = 'Concluido!';
    }

    renderStats() {
        const data = this.stats.getAll();
        let html = `
            <thead>
                <tr>
                    <th>Agente</th>
                    <th>Execucoes</th>
                    <th>Pont. media</th>
                    <th>Sucesso</th>
                    <th>Passos</th>
                </tr>
            </thead>
            <tbody>
        `;

        for (const tipo of ['reativo', 'modelo', 'onisciente']) {
            const s = data[tipo];
            html += `<tr>
                <td>${StatsStore.getLabel(tipo)}</td>
                <td>${s.execucoes}</td>
                <td>${s.execucoes ? s.pontuacaoMedia.toFixed(1) : '-'}</td>
                <td>${s.execucoes ? s.taxaSucesso.toFixed(0) + '%' : '-'}</td>
                <td>${s.execucoes ? s.passosMedio.toFixed(0) : '-'}</td>
            </tr>`;
        }

        html += '</tbody>';
        this.statsTable.innerHTML = html;
    }
}
