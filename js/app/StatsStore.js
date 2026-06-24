const STORAGE_KEY = 'aspirador_stats_v1';

const AGENTE_LABELS = {
    reativo: 'Reativo',
    modelo: 'Modelo',
    onisciente: 'Onisciente'
};

class StatsStore {
    constructor() {
        this.data = this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (_) { /* ignore */ }

        return {
            reativo: { execucoes: 0, pontuacaoMedia: 0, taxaSucesso: 0, passosMedio: 0 },
            modelo: { execucoes: 0, pontuacaoMedia: 0, taxaSucesso: 0, passosMedio: 0 },
            onisciente: { execucoes: 0, pontuacaoMedia: 0, taxaSucesso: 0, passosMedio: 0 }
        };
    }

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }

    registrarBatch(resultadoPorTipo) {
        for (const [tipo, stats] of Object.entries(resultadoPorTipo)) {
            if (!this.data[tipo]) continue;
            this.mergeStats(tipo, stats);
        }
        this.save();
    }

    registrarVisual(tipo, stats) {
        if (!this.data[tipo]) return;
        this.mergeStats(tipo, stats);
        this.save();
    }

    mergeStats(tipo, stats) {
        const atual = this.data[tipo];
        const nNovas = stats.total || 1;
        const nTotal = atual.execucoes + nNovas;

        atual.pontuacaoMedia = nTotal === 0 ? 0 :
            (atual.pontuacaoMedia * atual.execucoes + stats.pontuacao.media * nNovas) / nTotal;
        atual.taxaSucesso = nTotal === 0 ? 0 :
            (atual.taxaSucesso * atual.execucoes + stats.taxaSucesso * nNovas) / nTotal;
        atual.passosMedio = nTotal === 0 ? 0 :
            (atual.passosMedio * atual.execucoes + stats.passos.media * nNovas) / nTotal;
        atual.execucoes = nTotal;
    }

    getAll() {
        return this.data;
    }

    static getLabel(tipo) {
        return AGENTE_LABELS[tipo] || tipo;
    }
}
