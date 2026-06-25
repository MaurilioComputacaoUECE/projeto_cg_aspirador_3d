class CameraRobo {
    constructor(camera, robo) {
        this.camera = camera;
        this.robo = robo;
        this.alturaOlhos = 0.5; // Altura dos olhos do robô
        this.sensibilidadeMouse = 0.002;
        this.anguloVertical = 0;
        this.mousePreso = false;
    }

    // Atualiza a câmera para seguir o robô
    atualizar() {
        // Posição da câmera = posição do robô + altura
        const pos = this.robo.transform.position;
        this.camera.position = [
            pos[0],
            pos[1] + this.alturaOlhos,
            pos[2]
        ];

        // Rotação da câmera = rotação do robô
        // A câmera olha na direção que o robô está virado
        const rot = this.robo.transform.rotation;
        this.camera.rotation = [rot[0], rot[1], rot[2]];
    }

    // Atualiza com rotação do mouse (olhar para cima/baixo)
    atualizarComMouse(dx, dy) {
        this.anguloVertical -= dy * this.sensibilidadeMouse;
        this.anguloVertical = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.anguloVertical));
        
        // Aplica rotação vertical à câmera
        // A horizontal já vem do robô
        this.camera.rotation[0] = this.anguloVertical;
    }

    // Atualiza a visão do robô (quando o robô vira)
    atualizarVisaoRobo() {
        // A câmera horizontal segue o robô
        const rot = this.robo.transform.rotation;
        this.camera.rotation[1] = rot[1];
        // Mantém a vertical
        this.camera.rotation[0] = this.anguloVertical;
    }

    // Trava o mouse (clique no canvas)
    travarMouse(canvas) {
        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
            this.mousePreso = true;
        });

        document.addEventListener('pointerlockchange', () => {
            this.mousePreso = document.pointerLockElement === canvas;
        });
    }

    // Processa movimento do mouse
    processarMouse(e) {
        if (!this.mousePreso) return;
        this.atualizarComMouse(e.movementX, e.movementY);
    }

    // Configura eventos do mouse
    configurarEventos(canvas) {
        this.travarMouse(canvas);
        document.addEventListener('mousemove', (e) => this.processarMouse(e));
    }

    // Retorna a posição da câmera
    getPosicao() {
        return this.camera.position;
    }

    // Retorna a direção da câmera
    getDirecao() {
        return this.camera.getDirection();
    }
}