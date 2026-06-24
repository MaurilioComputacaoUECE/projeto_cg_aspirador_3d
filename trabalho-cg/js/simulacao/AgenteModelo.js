class AgenteModelo extends AgenteBase {
    constructor() {
        super();
        this.nome = 'Modelo';
        this.ultimaPosicao = null;
        this.vezesParado = 0;
    }

    executar(percepcoes, estado) {
        this.marcarVisitado(estado.x, estado.y);

        // Detecta se está na mesma posição (anti-loop)
        const posKey = `${estado.x},${estado.y}`;
        if (this.ultimaPosicao === posKey) {
            this.vezesParado++;
        } else {
            this.vezesParado = 0;
            this.ultimaPosicao = posKey;
        }

        // 1. Se tem sujeira, aspira
        if (percepcoes.temSujeira) {
            this.vezesParado = 0;
            return 'ASPIRAR';
        }

        // 2. Anti-loop: se parado por 3+ passos, gira 90° e reseta
        if (this.vezesParado > 3) {
            this.vezesParado = 0;
            this.virarDireita();
            return 'VIRAR_DIREITA';
        }

        // 3. Se frente bloqueada, procura direção livre
        if (!percepcoes.frenteLivre) {
            return this.escolherDirecao(estado, true);
        }

        // 4. Se frente já visitada, procura direção NÃO visitada
        const frente = this.getFrente(estado);
        if (this.jaVisitou(frente.x, frente.y)) {
            const direcaoNova = this.buscarDirecaoNaoVisitada(estado);
            if (direcaoNova !== null) {
                return this.moverParaDirecao(direcaoNova);
            }
        }

        // 5. Frente livre e não visitada, anda para frente
        return 'ANDAR_FRENTE';
    }

    // Busca direção não visitada (ignora frente)
    buscarDirecaoNaoVisitada(estado) {
        for (let i = 1; i < 4; i++) {
            const d = (this.direcao + i) % 4;
            const nx = estado.x + this.dx[d];
            const ny = estado.y + this.dy[d];
            
            if (this.isDentro(nx, ny, estado.tamanho) && !this.jaVisitou(nx, ny)) {
                return d;
            }
        }
        return null;
    }

    // Escolhe direção livre (para quando frente está bloqueada)
    escolherDirecao(estado, preferirNaoVisitada) {
        // Procura direção não visitada primeiro
        if (preferirNaoVisitada) {
            for (let i = 1; i < 4; i++) {
                const d = (this.direcao + i) % 4;
                const nx = estado.x + this.dx[d];
                const ny = estado.y + this.dy[d];
                
                if (this.isDentro(nx, ny, estado.tamanho) && !this.jaVisitou(nx, ny)) {
                    return this.moverParaDirecao(d);
                }
            }
        }

        // Qualquer direção livre
        for (let i = 1; i < 4; i++) {
            const d = (this.direcao + i) % 4;
            const nx = estado.x + this.dx[d];
            const ny = estado.y + this.dy[d];
            
            if (this.isDentro(nx, ny, estado.tamanho)) {
                return this.moverParaDirecao(d);
            }
        }

        // Fallback: 50% DIREITA, 50% ESQUERDA
        if (Math.random() < 0.5) {
            this.virarDireita();
            return 'VIRAR_DIREITA';
        } else {
            this.virarEsquerda();
            return 'VIRAR_ESQUERDA';
        }
    }

    // Move para uma direção específica, retornando o comando correto
    moverParaDirecao(d) {
        const diff = (d - this.direcao + 4) % 4;
        
        if (diff === 0) return 'ANDAR_FRENTE';
        if (diff === 1) {
            this.virarDireita();
            return 'VIRAR_DIREITA';
        }
        if (diff === 3) {
            this.virarEsquerda();
            return 'VIRAR_ESQUERDA';
        }
        if (diff === 2) {
            this.virarDireita();
            this.virarDireita();
            return 'ANDAR_FRENTE';
        }
    }

    reset() {
        super.reset();
        this.ultimaPosicao = null;
        this.vezesParado = 0;
    }
}