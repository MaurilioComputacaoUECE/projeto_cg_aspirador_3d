class AgenteBase {
    constructor() {
        this.nome = 'Base';
        this.direcao = 0;
        this.dx = [0, 1, 0, -1];
        this.dy = [-1, 0, 1, 0];
        this.visitados = new Set();
    }

    isDentro(x, y, tamanho) {
        return x >= 0 && x < tamanho && y >= 0 && y < tamanho;
    }

    getFrente(estado) {
        return {
            x: estado.x + this.dx[this.direcao],
            y: estado.y + this.dy[this.direcao]
        };
    }

    virarDireita() {
        this.direcao = (this.direcao + 1) % 4;
    }

    virarEsquerda() {
        this.direcao = (this.direcao + 3) % 4;
    }

    marcarVisitado(x, y) {
        this.visitados.add(`${x},${y}`);
    }

    jaVisitou(x, y) {
        return this.visitados.has(`${x},${y}`);
    }

    reset() {
        this.direcao = 0;
        this.visitados = new Set();
    }

    getNome() {
        return this.nome;
    }
}