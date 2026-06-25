class Simulador {
    constructor(config = {}) {
        this.config = {
            tamanho: 8,
            agenteTipo: 'reativo',
            maxPassos: 500,
            ...config
        };
        this.mundo = null;
        this.agente = null;
        this.historico = [];
        this.callbacks = {
            onPasso: null,
            onFim: null
        };
    }

    criarAgente(tipo) {
        switch (tipo) {
            case 'reativo': return new AgenteReativo();
            case 'modelo': return new AgenteModelo();
            case 'onisciente': return new AgenteOnisciente();
            default: throw new Error(`Agente desconhecido: ${tipo}`);
        }
    }

    executarUmaSimulacao() {
        const mundo = new MundoAspirador(this.config.tamanho);
        const agente = this.criarAgente(this.config.agenteTipo);
        agente.reset();

        if (this.config.agenteTipo === 'onisciente') {
            agente.setMapa(
                mundo.sujeira.map(s => ({ ...s })),
                mundo.obstaculos.map(o => ({ x: o.x, y: o.y, tipo: o.tipo })),
                mundo.tamanho
            );
        }

        let passos = 0;
        const maxPassos = this.config.maxPassos;

        while (passos < maxPassos && mundo.sujeira.length > 0) {
            const percepcoes = mundo.getPercepcoes();
            const estado = mundo.getEstado();
            const acao = agente.executar(percepcoes, estado);

            switch (acao) {
                case 'ASPIRAR':
                    mundo.aspirar();
                    break;
                case 'ANDAR_FRENTE':
                    mundo.andarFrente();
                    break;
                case 'ANDAR_DIREITA':
                    mundo.virarDireita();
                    mundo.andarFrente();
                    break;
                case 'ANDAR_ESQUERDA':
                    mundo.virarEsquerda();
                    mundo.andarFrente();
                    break;
                case 'VIRAR_DIREITA':
                    mundo.virarDireita();
                    break;
                case 'VIRAR_ESQUERDA':
                    mundo.virarEsquerda();
                    break;
                case 'VIRAR_DIREITA_ANDAR':
                mundo.virarDireita();
                mundo.andarFrente();
                break;

            case 'VIRAR_ESQUERDA_ANDAR':
                mundo.virarEsquerda();
                mundo.andarFrente();
                break;
                default:
                    mundo.andarFrente();
                    break;
            }

            passos++;
        }

        const estadoFinal = mundo.getEstado();
        return {
            sucesso: estadoFinal.sujeiraRestante === 0,
            passos: passos,
            pontuacao: mundo.getPontuacaoFinal(),
            sujeiraRestante: estadoFinal.sujeiraRestante,
            totalSujeira: estadoFinal.totalSujeira,
            cobertura: ((estadoFinal.totalSujeira - estadoFinal.sujeiraRestante) / estadoFinal.totalSujeira * 100),
            agente: this.config.agenteTipo,
            tamanho: this.config.tamanho,
            grade: mundo.getGrade()
        };
    }

    executarBatch(numSimulacoes = 100) {
        const resultados = [];
        for (let i = 0; i < numSimulacoes; i++) {
            const r = this.executarUmaSimulacao();
            resultados.push(r);
            if (this.callbacks.onProgresso) {
                this.callbacks.onProgresso(i + 1, numSimulacoes, this.config.agenteTipo);
            }
        }
        const stats = this.calcularStats(resultados);
        if (this.callbacks.onFim) {
            this.callbacks.onFim(stats);
        }
        return stats;
    }

    executarBatchMulti(config) {
        const tamanho = config.tamanho || 8;
        const tipos = ['reativo', 'modelo', 'onisciente'];
        const resultadoPorTipo = {};
        let totalGeral = 0;

        for (const tipo of tipos) {
            totalGeral += config[tipo] || 0;
        }

        let concluidas = 0;

        for (const tipo of tipos) {
            const quantidade = config[tipo] || 0;
            if (quantidade <= 0) continue;

            const sim = new Simulador({
                tamanho,
                agenteTipo: tipo,
                maxPassos: config.maxPassos || 500
            });

            const resultados = [];
            for (let i = 0; i < quantidade; i++) {
                resultados.push(sim.executarUmaSimulacao());
                concluidas++;
                if (this.callbacks.onProgresso) {
                    this.callbacks.onProgresso(concluidas, totalGeral, tipo);
                }
            }

            resultadoPorTipo[tipo] = sim.calcularStats(resultados);
        }

        if (this.callbacks.onFim) {
            this.callbacks.onFim(resultadoPorTipo);
        }

        return resultadoPorTipo;
    }

    executarVisual() {
        this.mundo = new MundoAspirador(this.config.tamanho);
        this.agente = this.criarAgente(this.config.agenteTipo);
        this.agente.reset();
        this.historico = [];
        this.passosExecutados = 0;

        if (this.config.agenteTipo === 'onisciente') {
            this.agente.setMapa(
                this.mundo.sujeira.map(s => ({ ...s })),
                this.mundo.obstaculos.map(o => ({ x: o.x, y: o.y, tipo: o.tipo })),
                this.mundo.tamanho
            );
        }

        return this;
    }

    passoVisual() {
        if (!this.mundo) return null;

        const maxPassos = this.config.maxPassos || 500;

        if (this.mundo.sujeira.length === 0 || this.passosExecutados >= maxPassos) {
            return {
                terminou: true,
                grade: this.mundo.getGrade(),
                passos: this.mundo.passos,
                sujeira: this.mundo.sujeira.length,
                pontuacao: this.mundo.getPontuacaoFinal(),
                sucesso: this.mundo.sujeira.length === 0
            };
        }

        const percepcoes = this.mundo.getPercepcoes();
        const estado = this.mundo.getEstado();
        const acao = this.agente.executar(percepcoes, estado);

        switch (acao) {
            case 'ASPIRAR': this.mundo.aspirar(); break;
            case 'ANDAR_FRENTE': this.mundo.andarFrente(); break;
            case 'ANDAR_DIREITA': this.mundo.virarDireita(); this.mundo.andarFrente(); break;
            case 'ANDAR_ESQUERDA': this.mundo.virarEsquerda(); this.mundo.andarFrente(); break;
            case 'VIRAR_DIREITA': this.mundo.virarDireita(); break;
            case 'VIRAR_ESQUERDA': this.mundo.virarEsquerda(); break;
            default: this.mundo.andarFrente(); break;
        }

        this.historico.push({ acao, estado: this.mundo.getEstado(), grade: this.mundo.getGrade() });
        this.passosExecutados++;

        if (this.callbacks.onPasso) {
            this.callbacks.onPasso({
                passos: this.mundo.passos,
                sujeira: this.mundo.sujeira.length,
                grade: this.mundo.getGrade(),
                acao: acao,
                estado: this.mundo.getEstado(),
                pontuacao: this.mundo.pontuacao
            });
        }

        const terminou = this.mundo.sujeira.length === 0 || this.passosExecutados >= maxPassos;

        return {
            terminou,
            grade: this.mundo.getGrade(),
            passos: this.mundo.passos,
            sujeira: this.mundo.sujeira.length,
            pontuacao: this.mundo.getPontuacaoFinal(),
            sucesso: this.mundo.sujeira.length === 0,
            acao
        };
    }

    calcularStats(resultados) {
        const total = resultados.length;
        const sucessos = resultados.filter(r => r.sucesso).length;
        const passos = resultados.map(r => r.passos);
        const cobertura = resultados.map(r => r.cobertura);
        const pontuacoes = resultados.map(r => r.pontuacao);

        const media = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

        return {
            total,
            sucessos,
            taxaSucesso: (sucessos / total * 100),
            passos: {
                media: media(passos),
                min: Math.min(...passos),
                max: Math.max(...passos)
            },
            cobertura: {
                media: media(cobertura),
                min: Math.min(...cobertura),
                max: Math.max(...cobertura)
            },
            pontuacao: {                              
                media: media(pontuacoes),
                min: Math.min(...pontuacoes),
                max: Math.max(...pontuacoes)
            },
            ultimo: resultados[resultados.length - 1]
        };
    }

    onPasso(callback) { this.callbacks.onPasso = callback; }
    onFim(callback) { this.callbacks.onFim = callback; }
    onProgresso(callback) { this.callbacks.onProgresso = callback; }
}