class AgenteReativo extends AgenteBase {
    constructor() {
        super();
        this.nome = 'Reativo';
    }

    executar(percepcoes, estado) {
        if (percepcoes.temSujeira) {
            return 'ASPIRAR';
        }

        if (!percepcoes.frenteLivre) {
            // 50% DIREITA, 50% ESQUERDA
            if (Math.random() < 0.5) {
                this.virarDireita();
                return 'VIRAR_DIREITA';
            } else {
                this.virarEsquerda();
                return 'VIRAR_ESQUERDA';
            }
        }

        return 'ANDAR_FRENTE';
    }

    reset() {
        super.reset();
    }
}