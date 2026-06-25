class Obstaculo {
    constructor(x, y, tipo = 'cadeira') {
        this.x = x;
        this.y = y;
        this.tipo = tipo;
        this.ativo = true;
        this.raio = 0.4;
        this.largura = 1;
        this.altura = 1;
        this.cor = this.getCor();
        this.altura3d = this.getAltura3d();
    }

    getCor() {
        const cores = {
            'cadeira': '#8B4513',
            'mesa': '#D2691E',
            'bola': '#FF4444',
            'vaso': '#4CAF50',
            'estante': '#795548'
        };
        return cores[this.tipo] || '#888';
    }

    getAltura3d() {
        const alturas = {
        'cadeira': 0.8,
        'mesa': 0.5,
        'vaso': 0.7,
        'abajur': 0.5,      
        'cama': 0.3,        
        'comoda': 0.5,      
        'lixeira': 0.4      
    };
        return alturas[this.tipo] || 0.5;
    }

    colideCom(x, y) {
        const dx = Math.abs(x - this.x);
        const dy = Math.abs(y - this.y);
        return dx < 0.5 && dy < 0.5;
    }

    toString() {
        return `${this.tipo} em (${this.x}, ${this.y})`;
    }
}