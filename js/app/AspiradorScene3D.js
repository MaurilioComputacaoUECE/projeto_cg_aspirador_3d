class AspiradorScene3D {
    constructor(canvasId, simulador, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.simulador = simulador;
        this.onFinish = options.onFinish || (() => { });
        this.intervaloPasso = options.intervaloPasso || 180;

        this.gl = getGL(this.canvas);
        if (!this.gl) throw new Error('WebGL indisponivel');

        this.mundo = simulador.mundo;
        this.tamanho = this.mundo.tamanho;
        this.offset = this.tamanho / 2;

        this.setupGL();
        this.setupShaders();

        this.camera = new Camera(60, this.canvas.width / this.canvas.height, 0.1, 100);
        this.modoCamera = 'primeira';
        this.camera.setPosition(0, this.tamanho * 0.9, this.tamanho * 0.8);
        this.camera.setTarget(0, 0, 0);
        this.camera.rotation = [-0.3, 0, 0];

        this.light = new Light([0, this.tamanho, 0], [0, -1, 0], [1, 0.95, 0.85]);
        this.time = 0;

        this.renderer = new Renderer(this.gl);
        this.renderer.clearColor = [0.06, 0.07, 0.1, 1];
        this.renderer.setSize(this.canvas.width, this.canvas.height);

        this.objetos = [];
        this.sujeiraMeshes = new Map();
        this.aspirador = null;
        this.ativo = false;
        this.keys = {};
        this.ultimoPasso = 0;
        this.resultadoFinal = null;
        this.simulacaoFinalizada = false;

        this.buildScene();
        this.setupControls();
    }

    gridParaMundo(gx, gy) {
        return {
            x: gx - this.offset + 0.5,
            z: gy - this.offset + 0.5
        };
    }

    orientacaoParaRotacaoY(orientacao) {
        return orientacao * 90;
    }

    rotacionarPonto(x, y, z, orientacao) {
        const angulo = orientacao * Math.PI / 2;
        const cos = Math.cos(angulo);
        const sin = Math.sin(angulo);
        return {
            x: x * cos + z * sin,
            y: y,
            z: -x * sin + z * cos
        };
    }

    hexParaRgb(hex) {
        const h = hex.replace('#', '');
        return [
            parseInt(h.substring(0, 2), 16) / 255,
            parseInt(h.substring(2, 4), 16) / 255,
            parseInt(h.substring(4, 6), 16) / 255
        ];
    }

    setupGL() {
        const gl = this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    }

    setupShaders() {
        const vtxSrc = document.getElementById('vertex-shader').text;
        const fragSrc = document.getElementById('frag-shader').text;
        const vtxShader = createShader(this.gl, this.gl.VERTEX_SHADER, vtxSrc);
        const fragShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragSrc);
        this.program = createProgram(this.gl, vtxShader, fragShader);
        if (!this.program) throw new Error('Falha ao criar shaders');
        this.gl.useProgram(this.program);
    }

    addObjeto(obj) {
        this.objetos.push(obj);
    }

    buildScene() {
        const gl = this.gl;
        const program = this.program;
        const t = this.tamanho;
        const meio = t / 2;

        const chao = new Cube(gl, program);
        chao.transform.setPosition(0, -0.025, 0);
        chao.transform.setScale(t, 0.05, t);
        chao.setTexture(Texture.createCheckerboard(gl, 0, 256, '#7a6a4f', '#5c4f3a'));
        this.addObjeto(chao);

        this.criarParede(program, 0, 0.6, -meio, t, 1.2, 0.15, 0.82, 0.8, 0.76);
        this.criarParede(program, 0, 0.6, meio, t, 1.2, 0.15, 0.82, 0.8, 0.76);
        this.criarParede(program, -meio, 0.6, 0, 0.15, 1.2, t, 0.76, 0.74, 0.72);
        this.criarParede(program, meio, 0.6, 0, 0.15, 1.2, t, 0.76, 0.74, 0.72);


        for (const s of this.mundo.sujeira) {
            this.criarSujeira(s.x, s.y);
        }

        // 1. CAMA (ocupa 2 células: grid 0,0 e 1,0)
        this.criarCama(this.program, -3.0, 0, -3.5);

        // 2. ABAJUR (grid 2,0)
        this.criarMesaAbajur(this.program, -0.5, 0, -3.5);

        // 3. CADEIRA (grid 2,1)
        this.criarCadeira(this.program, -0.5, 0, -2.5);

        // 4. CÔMODA (grid 6,6)
        this.criarComoda(this.program, 2.5, 0, 3.5);

        // 5. LIXEIRA (grid 7,7)
        this.criarLixeira(this.program, 3.5, 0, 3.5);

        // Decorações (não bloqueiam)
        this.criarTapete(this.program, 0, 0, 0);
        this.criarQuadro(this.program, 0, 0.7, -3.5);

        const ap = this.gridParaMundo(this.mundo.agente.x, this.mundo.agente.y);
        this.aspirador = this.criarAspirador(
            this.program,
            ap.x, 0, ap.z,
            this.mundo.agente.orientacao
        );
    }

    criarParede(program, x, y, z, sx, sy, sz, r, g, b) {
        const parede = new Cube(this.gl, program);
        parede.transform.setPosition(x, y, z);
        parede.transform.setScale(sx, sy, sz);
        parede.setColor(r, g, b, 1);
        this.addObjeto(parede);
    }

    criarAspirador(program, x, y, z, orientacao) {
        const grupo = [];

        // ==========================================
        // CORPO PRINCIPAL (disco achatado)
        // ==========================================
        const corpo = new Cube(this.gl, program);
        corpo.transform.setPosition(x, y + 0.15, z);
        corpo.transform.setScale(0.5, 0.12, 0.5);
        corpo.setColor(0.15, 0.15, 0.2, 1); // Cinza escuro
        this.addObjeto(corpo);
        grupo.push(corpo);

        // ==========================================
        // TAMPO SUPERIOR (mais claro)
        // ==========================================
        const tampo = new Cube(this.gl, program);
        tampo.transform.setPosition(x, y + 0.22, z);
        tampo.transform.setScale(0.42, 0.03, 0.42);
        tampo.setColor(0.2, 0.2, 0.25, 1);
        this.addObjeto(tampo);
        grupo.push(tampo);

        // ==========================================
        // ANEL DE DESTAQUE (borda)
        // ==========================================
        const anel = new Cube(this.gl, program);
        anel.transform.setPosition(x, y + 0.13, z);
        anel.transform.setScale(0.48, 0.02, 0.48);
        anel.setColor(0.3, 0.3, 0.35, 1);
        this.addObjeto(anel);
        grupo.push(anel);

        // ==========================================
        // BOTÃO LIGA/DESLIGA (topo)
        // ==========================================
        const botao = new Cube(this.gl, program);
        botao.transform.setPosition(x, y + 0.27, z + 0.05);
        botao.transform.setScale(0.05, 0.02, 0.05);
        botao.setColor(0.0, 0.8, 0.0, 1); // Verde (ligado)
        this.addObjeto(botao);
        grupo.push(botao);

        // ==========================================
        // LUZ INDICADORA
        // ==========================================
        const luz = new Cube(this.gl, program);
        luz.transform.setPosition(x, y + 0.27, z - 0.05);
        luz.transform.setScale(0.03, 0.01, 0.03);
        luz.setColor(0.0, 0.5, 1.0, 1); // Azul
        this.addObjeto(luz);
        grupo.push(luz);

        // ==========================================
        // RODAS LATERAIS
        // ==========================================
        const rodas = [
            [x - 0.35, y + 0.08, z],
            [x + 0.35, y + 0.08, z]
        ];
        const rodasMeshes = [];
        for (const pos of rodas) {
            const roda = new Cube(this.gl, program);
            roda.transform.setPosition(pos[0], pos[1], pos[2]);
            roda.transform.setScale(0.08, 0.06, 0.12);
            roda.setColor(0.1, 0.1, 0.1, 1);
            this.addObjeto(roda);
            grupo.push(roda);
            rodasMeshes.push(roda);
        }

        // ==========================================
        // RODINHA FRONTAL (giratória)
        // ==========================================
        const rodinha = new Cube(this.gl, program);
        rodinha.transform.setPosition(x, y + 0.04, z + 0.25);
        rodinha.transform.setScale(0.04, 0.03, 0.04);
        rodinha.setColor(0.1, 0.1, 0.1, 1);
        this.addObjeto(rodinha);
        grupo.push(rodinha);

        // ==========================================
        // ESCOVA FRONTAL (girando)
        // ==========================================
        const escova = new Cube(this.gl, program);
        escova.transform.setPosition(x, y + 0.04, z + 0.3);
        escova.transform.setScale(0.15, 0.02, 0.02);
        escova.setColor(0.8, 0.2, 0.2, 1); // Vermelho
        this.addObjeto(escova);
        grupo.push(escova);

        // Segunda parte da escova (cruz)
        const escova2 = new Cube(this.gl, program);
        escova2.transform.setPosition(x, y + 0.04, z + 0.3);
        escova2.transform.setScale(0.02, 0.02, 0.15);
        escova2.setColor(0.8, 0.2, 0.2, 1);
        this.addObjeto(escova2);
        grupo.push(escova2);

        // ==========================================
        // DEPÓSITO DE PÓ (tampa transparente)
        // ==========================================
        const deposito = new Cube(this.gl, program);
        deposito.transform.setPosition(x + 0.08, y + 0.2, z);
        deposito.transform.setScale(0.12, 0.06, 0.15);
        deposito.setColor(0.4, 0.5, 0.6, 0.5); // Transparente
        this.addObjeto(deposito);
        grupo.push(deposito);

        // Armazena as referências das partes individuais para sincronização
        this.partesAspirador = {
            corpo,
            tampo,
            anel,
            botao,
            luz,
            roda1: rodasMeshes[0],
            roda2: rodasMeshes[1],
            rodinha,
            escova1: escova,
            escova2: escova2,
            deposito
        };

        return grupo;
    }

    criarSujeira(gx, gy) {
        const pos = this.gridParaMundo(gx, gy);
        const chave = `${gx},${gy}`;
        const grupo = [];

        // Número aleatório de partículas (5 a 12)
        const numParticulas = 5 + Math.floor(Math.random() * 8);

        for (let i = 0; i < numParticulas; i++) {
            // Posição aleatória dentro da célula
            const offsetX = (Math.random() - 0.5) * 0.5;
            const offsetZ = (Math.random() - 0.5) * 0.5;

            // Tamanho aleatório
            const tamanho = 0.03 + Math.random() * 0.08;

            // Cor variável (tons de marrom/sujeira)
            const r = 0.3 + Math.random() * 0.3;
            const g = 0.15 + Math.random() * 0.2;
            const b = 0.05 + Math.random() * 0.1;

            // Altura aleatória (ligeiramente variada)
            const altura = 0.01 + Math.random() * 0.03;

            const particula = new Cube(this.gl, this.program);
            particula.transform.setPosition(
                pos.x + offsetX,
                altura,
                pos.z + offsetZ
            );
            particula.transform.setScale(tamanho, altura, tamanho);
            particula.setColor(r, g, b, 0.9); // Quase opaco
            this.addObjeto(particula);
            grupo.push(particula);
        }

        // Guarda todas as partículas do grupo
        this.sujeiraMeshes.set(chave, grupo);
    }

    criarCadeira(program, x, y, z) {
        // Assento
        const assento = new Cube(this.gl, program);
        assento.transform.setPosition(x, y + 0.35, z);
        assento.transform.setScale(0.35, 0.05, 0.35);
        assento.setColor(0.6, 0.4, 0.2, 1);
        this.addObjeto(assento);

        // Encosto
        const encosto = new Cube(this.gl, program);
        encosto.transform.setPosition(x, y + 0.65, z + 0.15);
        encosto.transform.setScale(0.35, 0.35, 0.05);
        encosto.setColor(0.5, 0.35, 0.15, 1);
        this.addObjeto(encosto);

        // 4 Pernas
        const pernas = [
            [x - 0.12, y + 0.15, z - 0.12],
            [x + 0.12, y + 0.15, z - 0.12],
            [x - 0.12, y + 0.15, z + 0.12],
            [x + 0.12, y + 0.15, z + 0.12]
        ];
        for (const pos of pernas) {
            const perna = new Cube(this.gl, program);
            perna.transform.setPosition(pos[0], pos[1], pos[2]);
            perna.transform.setScale(0.04, 0.3, 0.04);
            perna.setColor(0.4, 0.25, 0.1, 1);
            this.addObjeto(perna);
        }
    }

    criarMesaAbajur(program, x, y, z) {
        // Tampo da mesa
        const tampo = new Cube(this.gl, program);
        tampo.transform.setPosition(x, y + 0.4, z);
        tampo.transform.setScale(0.5, 0.04, 0.4);
        tampo.setColor(0.5, 0.4, 0.25, 1);
        this.addObjeto(tampo);

        // 4 Pernas
        const pernas = [
            [x - 0.2, y + 0.15, z - 0.15],
            [x + 0.2, y + 0.15, z - 0.15],
            [x - 0.2, y + 0.15, z + 0.15],
            [x + 0.2, y + 0.15, z + 0.15]
        ];
        for (const pos of pernas) {
            const perna = new Cube(this.gl, program);
            perna.transform.setPosition(pos[0], pos[1], pos[2]);
            perna.transform.setScale(0.04, 0.3, 0.04);
            perna.setColor(0.3, 0.2, 0.1, 1);
            this.addObjeto(perna);
        }

        // Base do abajur
        const base = new Cube(this.gl, program);
        base.transform.setPosition(x + 0.15, y + 0.45, z - 0.1);
        base.transform.setScale(0.15, 0.04, 0.15);
        base.setColor(0.2, 0.15, 0.1, 1);
        this.addObjeto(base);

        // Haste
        const haste = new Cube(this.gl, program);
        haste.transform.setPosition(x + 0.15, y + 0.6, z - 0.1);
        haste.transform.setScale(0.02, 0.15, 0.02);
        haste.setColor(0.6, 0.5, 0.4, 1);
        this.addObjeto(haste);

        // Cúpula
        const cupula = new Cube(this.gl, program);
        cupula.transform.setPosition(x + 0.15, y + 0.7, z - 0.1);
        cupula.transform.setScale(0.2, 0.06, 0.2);
        cupula.setColor(0.9, 0.8, 0.6, 1);
        this.addObjeto(cupula);

        // Luz
        const luz = new Cube(this.gl, program);
        luz.transform.setPosition(x + 0.15, y + 0.67, z - 0.1);
        luz.transform.setScale(0.08, 0.02, 0.08);
        luz.setColor(1.0, 0.9, 0.5, 0.6);
        this.addObjeto(luz);
    }

    criarCama(program, x, y, z) {
        // COLCHÃO
        const colchao = new Cube(this.gl, program);
        colchao.transform.setPosition(x, y + 0.2, z);
        colchao.transform.setScale(1.8, 0.15, 0.9);
        colchao.setColor(0.3, 0.5, 0.7, 1);
        this.addObjeto(colchao);

        // TRAVESSEIRO (posicionado na cabeceira usando só posição)
        const trav = new Cube(this.gl, program);

        const larguraColchao = 1.8;
        const profundidadeColchao = 0.9;

        // encosta na borda da cabeceira (lado negativo do Z)
        const xTrav = x - 0.6; // centralizado na largura
        const yTrav = y + 0.25;

        const zTrav = z - (profundidadeColchao / 2) + 0.15;

        trav.transform.setPosition(xTrav, yTrav, zTrav);

        // aqui está o ponto-chave:
        // fazemos ele "deitado na largura da cama"
        trav.transform.setScale(0.3, 0.08, 0.8);

        trav.setColor(0.9, 0.9, 0.9, 1);
        this.addObjeto(trav);
    }
    criarComoda(program, x, y, z) {
        // Corpo
        const corpo = new Cube(this.gl, program);
        corpo.transform.setPosition(x, y + 0.6, z);
        corpo.transform.setScale(0.9, 1.2, 0.5);
        corpo.transform.setRotation(0, 180, 0); // ← VIRA 180°
        corpo.setColor(0.6, 0.4, 0.2, 1);
        this.addObjeto(corpo);

        // Gavetas
        const numGavetas = 3;
        const alturaTotal = 1.2;
        const alturaGaveta = alturaTotal / numGavetas;

        for (let i = 0; i < numGavetas; i++) {
            const gaveta = new Cube(this.gl, program);
            gaveta.transform.setPosition(
                x,
                y + 0.2 + i * alturaGaveta,
                z - 0.26   // ← Z NEGATIVO (frente para parede)
            );
            gaveta.transform.setScale(0.85, alturaGaveta * 0.6, 0.05);
            gaveta.transform.setRotation(0, 180, 0); // ← VIRA 180°
            gaveta.setColor(0.4, 0.25, 0.15, 1);
            this.addObjeto(gaveta);
        }
    }
    criarLixeira(program, x, y, z) {
        // Corpo
        const corpo = new Cube(this.gl, program);
        corpo.transform.setPosition(x, y + 0.25, z);
        corpo.transform.setScale(0.25, 0.35, 0.25);
        corpo.setColor(0.3, 0.3, 0.3, 1);
        this.addObjeto(corpo);

        // Tampa
        const tampa = new Cube(this.gl, program);
        tampa.transform.setPosition(x, y + 0.45, z);
        tampa.transform.setScale(0.28, 0.04, 0.28);
        tampa.setColor(0.4, 0.4, 0.4, 1);
        this.addObjeto(tampa);

        // Alça
        const alca = new Cube(this.gl, program);
        alca.transform.setPosition(x, y + 0.5, z);
        alca.transform.setScale(0.1, 0.04, 0.04);
        alca.setColor(0.5, 0.5, 0.5, 1);
        this.addObjeto(alca);
    }


    criarAbajur(program, x, y, z) {
        // Base
        const base = new Cube(this.gl, program);
        base.transform.setPosition(x, y + 0.05, z);
        base.transform.setScale(0.2, 0.04, 0.2);
        base.setColor(0.2, 0.15, 0.1, 1);
        this.addObjeto(base);

        // Haste
        const haste = new Cube(this.gl, program);
        haste.transform.setPosition(x, y + 0.25, z);
        haste.transform.setScale(0.02, 0.2, 0.02);
        haste.setColor(0.6, 0.5, 0.4, 1);
        this.addObjeto(haste);

        // Cúpula
        const cupula = new Cube(this.gl, program);
        cupula.transform.setPosition(x, y + 0.4, z);
        cupula.transform.setScale(0.25, 0.06, 0.25);
        cupula.setColor(0.9, 0.8, 0.6, 1);
        this.addObjeto(cupula);
    }

    criarTapete(program, x, y, z) {
        const tapete = new Cube(this.gl, program);
        tapete.transform.setPosition(x, y + 0.01, z);
        tapete.transform.setScale(1.5, 0.02, 1.0);
        const img = new Image();
        img.src = 'js/imagens/tapete.png';
        img.onload = () => {
            console.log("✅ Imagem carregou!");
            const texture = new Texture(this.gl, img, 5);
            tapete.setTexture(texture);
        };
        // ==========================================

        this.addObjeto(tapete);

    }

    criarQuadro(program, x, y, z) {
        const moldura = new Cube(this.gl, program);
        moldura.transform.setPosition(x, y, z);
        moldura.transform.setScale(0.4, 0.3, 0.01);
        moldura.setColor(0.8, 0.7, 0.6, 1);
        this.addObjeto(moldura);

        // "Imagem" dentro do quadro
        const imagem = new Cube(this.gl, program);
        imagem.transform.setPosition(x, y, z + 0.005);
        imagem.transform.setScale(0.3, 0.2, 0.005);
        imagem.setColor(0.2, 0.5, 0.3, 1);
        this.addObjeto(imagem);
    }
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'Escape') this.parar(true);
            if (e.key === 'c' || e.key === 'C') {
                const novo = this.modoCamera === 'primeira' ? 'topo' : 'primeira';
                this.trocarCamera(novo);
                // Atualiza o HUD imediatamente
                this.atualizarHUD({ terminou: false });
            }
        });
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);

        this.canvas.addEventListener('click', () => {
            if (this.ativo) this.canvas.requestPointerLock();
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas && this.ativo) {
                const s = 0.002;
                // Só permite ajuste vertical na primeira pessoa
                if (this.modoCamera === 'primeira') {
                    this.camera.rotation[0] -= e.movementY * s;
                    this.camera.rotation[0] = Math.max(-1.2, Math.min(1.2, this.camera.rotation[0]));
                } else {
                    // Visão de topo: movimento horizontal
                    this.camera.rotation[1] -= e.movementX * s;
                }
            }
        });
    }

    iniciar() {
        this.ativo = true;
        this.ultimoPasso = performance.now();
        this.loop(performance.now());
    }

    parar(voltarMenu) {
        this.ativo = false;
        if (document.pointerLockElement === this.canvas) {
            document.exitPointerLock();
        }
        if (voltarMenu && this.onFinish) {
            this.onFinish(this.resultadoFinal);
        }
    }

    loop(now) {
        if (!this.ativo) return;

        this.updateCamera(now);
        this.updateSimulacao(now);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    updateCamera(now) {
        this.time += 0.016;

        if (this.modoCamera === 'primeira') {
            // ============================================
            // CÂMERA EM PRIMEIRA PESSOA (SEGUE O ROBO)
            // ============================================
            const pos = this.gridParaMundo(
                this.mundo.agente.x,
                this.mundo.agente.y
            );

            // Posiciona a câmera na altura dos olhos do robo
            this.camera.position[0] = pos.x;
            this.camera.position[1] = 0.6; // Altura dos olhos
            this.camera.position[2] = pos.z;

            // A rotação horizontal segue a orientação do robo
            // Mas o mouse pode ajustar
            const orientacaoRad = this.mundo.agente.orientacao * Math.PI / 2;
            this.camera.rotation[1] = -orientacaoRad; // Sincroniza com o robo

            // O target segue a direção que o robo está olhando
            this.camera.target = [
                this.camera.position[0] - Math.sin(this.camera.rotation[1]) * Math.cos(this.camera.rotation[0]),
                this.camera.position[1] + Math.sin(this.camera.rotation[0]),
                this.camera.position[2] - Math.cos(this.camera.rotation[1]) * Math.cos(this.camera.rotation[0])
            ];

        } else {
            // ============================================
            // VISÃO DE CIMA (TOPO)
            // ============================================
            const speed = 0.07;
            const lim = this.tamanho / 2 - 0.5;

            const forward = [
                -Math.sin(this.camera.rotation[1]),
                0,
                -Math.cos(this.camera.rotation[1])
            ];
            const right = [
                Math.cos(this.camera.rotation[1]),
                0,
                -Math.sin(this.camera.rotation[1])
            ];

            if (this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']) {
                this.camera.position[0] += forward[0] * speed;
                this.camera.position[2] += forward[2] * speed;
            }
            if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) {
                this.camera.position[0] -= forward[0] * speed;
                this.camera.position[2] -= forward[2] * speed;
            }
            if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) {
                this.camera.position[0] -= right[0] * speed;
                this.camera.position[2] -= right[2] * speed;
            }
            if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) {
                this.camera.position[0] += right[0] * speed;
                this.camera.position[2] += right[2] * speed;
            }

            this.camera.position[0] = Math.max(-lim, Math.min(lim, this.camera.position[0]));
            this.camera.position[2] = Math.max(-lim, Math.min(lim, this.camera.position[2]));
            this.camera.position[1] = Math.max(0.5, Math.min(this.tamanho, this.camera.position[1]));

            this.camera.target = [
                this.camera.position[0] - Math.sin(this.camera.rotation[1]) * Math.cos(this.camera.rotation[0]),
                this.camera.position[1] + Math.sin(this.camera.rotation[0]),
                this.camera.position[2] - Math.cos(this.camera.rotation[1]) * Math.cos(this.camera.rotation[0])
            ];
        }

        // LUZ (circulando)
        const raio = this.tamanho * 0.6;
        this.light.setPosition(
            Math.sin(this.time * 0.5) * raio,
            this.tamanho * 0.8,
            Math.cos(this.time * 0.5) * raio
        );
    }

    trocarCamera(modo) {
        this.modoCamera = modo;
        if (modo === 'topo') {
            // Visão de cima
            this.camera.setPosition(0, this.tamanho * 1.2, this.tamanho * 0.5);
            this.camera.setTarget(0, 0, 0);
            this.camera.rotation = [-1.0, 0, 0];
        } else {
            // Primeira pessoa - posição será atualizada pelo updateCamera
            this.camera.setPosition(0, 0.6, 0);
            this.camera.setTarget(0, 0, -1);
            this.camera.rotation = [0, 0, 0];
        }
    }

    updateSimulacao(now) {
        if (this.simulacaoFinalizada) return;
        if (now - this.ultimoPasso < this.intervaloPasso) return;
        this.ultimoPasso = now;

        const resultado = this.simulador.passoVisual();
        if (!resultado) return;

        this.syncMundo3D();
        this.atualizarHUD(resultado);

        if (resultado.terminou) {
            this.simulacaoFinalizada = true;
            this.resultadoFinal = resultado;
            setTimeout(() => this.parar(true), 1500);
        }
    }

    syncMundo3D() {
        const m = this.simulador.mundo;
        const pos = this.gridParaMundo(m.agente.x, m.agente.y);
        const angulo = this.orientacaoParaRotacaoY(m.agente.orientacao);

        if (this.partesAspirador) {

            // Corpo (referência principal)
            this.partesAspirador.corpo.transform.setPosition(pos.x, 0.15, pos.z);
            this.partesAspirador.corpo.transform.setRotation(0, angulo, 0);

            // resto só acompanha posição (SEM rotação individual)
            const atualizar = (obj, x, y, z) => {
                obj.transform.setPosition(pos.x + x, y + 0.15, pos.z + z);
                obj.transform.setRotation(0, angulo, 0);
            };

            atualizar(this.partesAspirador.tampo, 0, 0.22 - 0.15, 0);
            atualizar(this.partesAspirador.anel, 0, 0.13 - 0.15, 0);

            const bPos = this.rotacionarPonto(0.05, 0, -0.05, m.agente.orientacao);
            atualizar(this.partesAspirador.botao, bPos.x, 0.27 - 0.15, bPos.z);

            const lPos = this.rotacionarPonto(-0.05, 0, -0.05, m.agente.orientacao);
            atualizar(this.partesAspirador.luz, lPos.x, 0.27 - 0.15, lPos.z);

            const r1 = this.rotacionarPonto(-0.35, 0, 0, m.agente.orientacao);
            atualizar(this.partesAspirador.roda1, r1.x, 0.08 - 0.15, r1.z);

            const r2 = this.rotacionarPonto(0.35, 0, 0, m.agente.orientacao);
            atualizar(this.partesAspirador.roda2, r2.x, 0.08 - 0.15, r2.z);

            const rf = this.rotacionarPonto(0, 0, 0.25, m.agente.orientacao);
            atualizar(this.partesAspirador.rodinha, rf.x, 0.04 - 0.15, rf.z);

            const ef = this.rotacionarPonto(0, 0, 0.3, m.agente.orientacao);
            atualizar(this.partesAspirador.escova1, ef.x, 0.04 - 0.15, ef.z);
            atualizar(this.partesAspirador.escova2, ef.x, 0.04 - 0.15, ef.z);

            const dp = this.rotacionarPonto(0.08, 0, 0, m.agente.orientacao);
            atualizar(this.partesAspirador.deposito, dp.x, 0.2 - 0.15, dp.z);
        }

        // ==========================================
        // ATUALIZA SUJEIRA (agora com grupos)
        // ==========================================
        for (const [key, grupo] of this.sujeiraMeshes.entries()) {
            const [gx, gy] = key.split(',').map(Number);
            const aindaTem = m.sujeira.some(s => s.x === gx && s.y === gy);

            // Esconde ou mostra cada partícula do grupo
            for (const mesh of grupo) {
                mesh.visivel = aindaTem;
            }
        }
    }

    atualizarHUD(resultado) {
        const hud = document.getElementById('hud');
        if (!hud) return;

        const m = this.simulador.mundo;
        const labels = { reativo: 'Reativo', modelo: 'Modelo', onisciente: 'Onisciente' };
        const tipo = labels[this.simulador.config.agenteTipo] || this.simulador.config.agenteTipo;
        const modoLabel = this.modoCamera === 'primeira' ? '👁️ 1ª pessoa' : '🗺️ Visão topo';

        hud.innerHTML = `
            <strong>Agente ${tipo}</strong><br>
            Passos: ${m.passos} | Sujeira: ${m.sujeira.length}/${m.totalSujeira}<br>
            Pontuacao: ${m.pontuacao}
            ${resultado.terminou ? '<br><span style="color:#8f8">Simulacao encerrada!</span>' : ''}
            <br><small>ESC = voltar ao menu | WASD + mouse = camera</small>
        `;
    }

    render() {
        if (!this.program) return;
        this.renderer.clear();

        const gl = this.gl;
        const lightPos = gl.getUniformLocation(this.program, 'uLightPos');
        const lightColor = gl.getUniformLocation(this.program, 'uLightColor');
        const viewPos = gl.getUniformLocation(this.program, 'uViewPos');
        const useTexLoc = gl.getUniformLocation(this.program, 'uUseTexture');
        const texLoc = gl.getUniformLocation(this.program, 'uTexture');
        const modelLoc = gl.getUniformLocation(this.program, 'model');
        const viewLoc = gl.getUniformLocation(this.program, 'view');
        const projLoc = gl.getUniformLocation(this.program, 'projection');
        const colorLoc = gl.getUniformLocation(this.program, 'uColor');

        gl.uniform3fv(lightPos, this.light.getPosition());
        gl.uniform3fv(lightColor, this.light.getColor());
        gl.uniform3fv(viewPos, this.camera.position);

        const view = matrixToFloat32ColumnMajor(this.camera.getViewMatrix());
        const proj = matrixToFloat32ColumnMajor(this.camera.getProjectionMatrix());

        for (const obj of this.objetos) {
            if (obj.visivel === false) continue;

            const model = matrixToFloat32ColumnMajor(obj.transform.getModelMatrix());
            gl.uniformMatrix4fv(modelLoc, false, model);
            gl.uniformMatrix4fv(viewLoc, false, view);
            gl.uniformMatrix4fv(projLoc, false, proj);

            if (obj.useTexture && obj.texture) {
                obj.texture.bind();
                gl.uniform1i(texLoc, obj.texture.unit);
                gl.uniform1i(useTexLoc, 1);
            } else {
                gl.uniform1i(useTexLoc, 0);
                if (colorLoc) gl.uniform3fv(colorLoc, obj.color.slice(0, 3));
            }

            obj.draw();
        }
    }
}