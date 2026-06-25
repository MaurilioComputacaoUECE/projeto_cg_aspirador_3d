class AgenteOnisciente extends AgenteBase {
    constructor() {
        super();
        this.nome = 'Onisciente';
        this.plano = [];
        this.sujeiras = [];
        this.obstaculos = [];
        this.tamanho = 0;
        this.mapaCompleto = null;
        this.contador = 0;
    }

    setMapa(sujeiras, obstaculos, tamanho) {
        this.sujeiras = sujeiras;
        this.obstaculos = obstaculos;
        this.tamanho = tamanho;
        
        const inicio = { x: Math.floor(tamanho/2), y: Math.floor(tamanho/2) };
        this.sujeiras.sort((a, b) => {
            const da = Math.abs(a.x - inicio.x) + Math.abs(a.y - inicio.y);
            const db = Math.abs(b.x - inicio.x) + Math.abs(b.y - inicio.y);
            return da - db;
        });
        
        this.plano = this.gerarPlano(inicio, 0);
    }

    gerarPlano(inicio, orientacao = 0) {
        const plano = [];
        let posAtual = inicio;
        let orientacaoAtual = orientacao;
        const restantes = this.sujeiras.filter(s => {
            if (s.x === posAtual.x && s.y === posAtual.y) return false;
        return true;
    });

        while (restantes.length > 0) {
            let maisProxima = null;
            let menorDist = Infinity;
            
            for (const s of restantes) {
                const dist = Math.abs(s.x - posAtual.x) + Math.abs(s.y - posAtual.y);
                if (dist < menorDist) {
                    menorDist = dist;
                    maisProxima = s;
                }
            }

            if (!maisProxima) break;

            const caminho = this.bfs(posAtual, maisProxima, orientacaoAtual);
            
            if (caminho.length === 0) {
                const idx = restantes.indexOf(maisProxima);
                if (idx !== -1) restantes.splice(idx, 1);
                continue;
            }

            for (const acao of caminho) {
                plano.push(acao);
                // Atualiza orientação durante o caminho
                if (acao === 'VIRAR_DIREITA') orientacaoAtual = (orientacaoAtual + 1) % 4;
                else if (acao === 'VIRAR_ESQUERDA') orientacaoAtual = (orientacaoAtual + 3) % 4;
            }
            plano.push('ASPIRAR');
            
            posAtual = maisProxima;
            const idx = restantes.indexOf(maisProxima);
            if (idx !== -1) restantes.splice(idx, 1);
        }

        return plano;
    }

    bfs(inicio, alvo, orientacaoInicial) {
        const fila = [{
            x: inicio.x,
            y: inicio.y,
            orientacao: orientacaoInicial,
            caminho: []
        }];
        
        const visitados = new Set();
        visitados.add(`${inicio.x},${inicio.y},${orientacaoInicial}`);

        const dx = [0, 1, 0, -1];
        const dy = [-1, 0, 1, 0];

        while (fila.length > 0) {
            const atual = fila.shift();

            if (atual.x === alvo.x && atual.y === alvo.y) {
                return atual.caminho;
            }

            const nx = atual.x + dx[atual.orientacao];
            const ny = atual.y + dy[atual.orientacao];
            
            if (this.isLivre(nx, ny)) {
                const key = `${nx},${ny},${atual.orientacao}`;
                if (!visitados.has(key)) {
                    visitados.add(key);
                    fila.push({
                        x: nx,
                        y: ny,
                        orientacao: atual.orientacao,
                        caminho: [...atual.caminho, 'ANDAR_FRENTE']
                    });
                }
            }

            const dirOrient = (atual.orientacao + 1) % 4;
            const keyDir = `${atual.x},${atual.y},${dirOrient}`;
            if (!visitados.has(keyDir)) {
                visitados.add(keyDir);
                fila.push({
                    x: atual.x,
                    y: atual.y,
                    orientacao: dirOrient,
                    caminho: [...atual.caminho, 'VIRAR_DIREITA']
                });
            }

            const esqOrient = (atual.orientacao + 3) % 4;
            const keyEsq = `${atual.x},${atual.y},${esqOrient}`;
            if (!visitados.has(keyEsq)) {
                visitados.add(keyEsq);
                fila.push({
                    x: atual.x,
                    y: atual.y,
                    orientacao: esqOrient,
                    caminho: [...atual.caminho, 'VIRAR_ESQUERDA']
                });
            }
        }

        return [];
    }

    isLivre(x, y) {
        if (x < 0 || x >= this.tamanho) return false;
        if (y < 0 || y >= this.tamanho) return false;
        
        for (const o of this.obstaculos) {
            if (o.x === x && o.y === y) return false;
        }
        
        return true;
    }

    executar(percepcoes, estado) {
        this.contador++;

        if (this.plano.length > 0) {
            const proximaAcao = this.plano[0];
            
            // Se for ASPIRAR e não tem sujeira, remove do plano
            if (proximaAcao === 'ASPIRAR' && !percepcoes.temSujeira) {
                this.plano.shift(); // Remove o ASPIRAR
                console.log('⚠️ ASPIRAR sem sujeira - removido do plano');
                return this.executar(percepcoes, estado); // Recalcula
            }
        }
        
        if (percepcoes.temSujeira) {
            this.sujeiras = this.sujeiras.filter(s => !(s.x === estado.x && s.y === estado.y));
            return 'ASPIRAR';
        }

        if (this.plano.length === 0) {
            if (this.sujeiras.length > 0) {
                const inicio = { x: estado.x, y: estado.y };
                this.plano = this.gerarPlano(inicio, estado.orientacao);
            }
            
            if (this.plano.length === 0) {
                this.virarDireita();
                return 'VIRAR_DIREITA';
            }
        }

        const acao = this.plano.shift();

        if (acao === 'ANDAR_FRENTE' && !percepcoes.frenteLivre) {
            this.virarDireita();
            return 'VIRAR_DIREITA';
        }

        return acao;
    }

    reset() {
        super.reset();
        this.plano = [];
        this.sujeiras = [];
        this.obstaculos = [];
        this.tamanho = 0;
        this.mapaCompleto = null;
        this.contador = 0;
    }
}