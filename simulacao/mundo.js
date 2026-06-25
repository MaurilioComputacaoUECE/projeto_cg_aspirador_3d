class MundoAspirador {
        constructor(tamanho = 8) {
            this.tamanho = tamanho;
            this.passos = 0;
            this.agente = {
                x: Math.floor(tamanho / 2),
                y: Math.floor(tamanho / 2),
                orientacao: 0
            };
            this.sujeira = [];
            this.obstaculos = [];
            this.totalSujeira = 0;
            this.pontuacao = 0;        
            this.sujeirasLimpass = 0;
            this.inicializar();
        }

        inicializar() {
            this.passos = 0;
            this.pontuacao = 0;          
            this.sujeirasLimpass = 0; 
            this.agente.x = Math.floor(this.tamanho / 2);
            this.agente.y = Math.floor(this.tamanho / 2);
            this.agente.orientacao = 0;
            this.sujeira = [];
            this.obstaculos = [];

            const posicoes = [
            [0, 0, 'cama'],
            [1, 0, 'cama'],
            [3, 0, 'abajur'],
            [3, 1, 'cadeira'],
            [6, 7, 'comoda'],
            [7, 7, 'lixeira']
        ];

            for (const [x, y, tipo] of posicoes) {
                if (x === this.agente.x && y === this.agente.y) continue;
                this.obstaculos.push(new Obstaculo(x, y, tipo));
            }

            // --- SUJEIRA ---
            const numSujeira = Math.floor(this.tamanho * this.tamanho * 0.2);
            let tentativas = 0;
            while (this.sujeira.length < numSujeira && tentativas < 1000) {
                const x = Math.floor(Math.random() * this.tamanho);
                const y = Math.floor(Math.random() * this.tamanho);

                if (x === this.agente.x && y === this.agente.y) continue;
                if (this.isObstaculo(x, y)) continue;
                if (this.sujeira.some(s => s.x === x && s.y === y)) continue;

                this.sujeira.push({ x, y });
                tentativas++;
            }
            this.totalSujeira = this.sujeira.length;
        }

        isObstaculo(x, y) {
            return this.obstaculos.some(o => o.colideCom(x, y));
        }

        getPercepcoes() {
            const x = this.agente.x, y = this.agente.y;
            const dx = [0, 1, 0, -1];
            const dy = [-1, 0, 1, 0];
            const dir = this.agente.orientacao;
            const fx = x + dx[dir];
            const fy = y + dy[dir];

            return {
                temSujeira: this.sujeira.some(s => s.x === x && s.y === y),
                frenteLivre: this.isDentro(fx, fy) && !this.isObstaculo(fx, fy)
            };
        }

        isDentro(x, y) {
            return x >= 0 && x < this.tamanho && y >= 0 && y < this.tamanho;
        }

        aspirar() {
            const idx = this.sujeira.findIndex(s => s.x === this.agente.x && s.y === this.agente.y);
            if (idx !== -1) {
                this.sujeira.splice(idx, 1);
                this.sujeirasLimpass++;          
                this.pontuacao += 10; 
                return true;
            }
            return false;
        }

        andarFrente() {
            const dx = [0, 1, 0, -1];
            const dy = [-1, 0, 1, 0];
            const dir = this.agente.orientacao;
            const nx = this.agente.x + dx[dir];
            const ny = this.agente.y + dy[dir];

            if (this.isDentro(nx, ny) && !this.isObstaculo(nx, ny)) {
                this.agente.x = nx;
                this.agente.y = ny;
                this.passos++;
                this.pontuacao -= 1;
                return true;
            }
            this.pontuacao -= 5;
            return false;
        }

        virarDireita() {
            this.agente.orientacao = (this.agente.orientacao + 1) % 4;
            this.pontuacao -= 1; 
        }

        virarEsquerda() {
            this.agente.orientacao = (this.agente.orientacao + 3) % 4;
            this.pontuacao -= 1;  
        }

        getPontuacaoFinal() {
            let total = this.pontuacao;
            if (this.sujeira.length === 0) {
                total += 300;                     // <-- NOVO: +300 bônus por limpar tudo
            }
            return total;
        }

        getEstado() {
            return {
                x: this.agente.x,
                y: this.agente.y,
                orientacao: this.agente.orientacao,
                tamanho: this.tamanho,
                sujeiraRestante: this.sujeira.length,
                totalSujeira: this.totalSujeira,
                passos: this.passos,
                pontuacao: this.pontuacao 
            };
        }

        // Para visualização
        getGrade() {
            const grade = [];
            for (let y = 0; y < this.tamanho; y++) {
                const linha = [];
                for (let x = 0; x < this.tamanho; x++) {
                    let celula = '·';
                    if (this.isObstaculo(x, y)) celula = '🧱';
                    else if (this.sujeira.some(s => s.x === x && s.y === y)) celula = '🟫';
                    else if (this.agente.x === x && this.agente.y === y) celula = '🧹';
                    linha.push(celula);
                }
                grade.push(linha);
            }
            return grade;
        }
    }