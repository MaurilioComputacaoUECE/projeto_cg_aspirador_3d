class Renderer {
    constructor(gl) {
        this.gl = gl;
        this.clearColor = [0, 0, 0, 1];
        this.meshes = [];
        this.textures = [];
        this.angle = 0;
    }
    
    setSize(width, height) {
        this.gl.viewport(0, 0, width, height);
    }
    
    clear() {
        this.gl.clearColor(...this.clearColor);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    
    addMesh(mesh) {
        this.meshes.push(mesh);
    }
    
    addTexture(texture) {
        this.textures.push(texture);
    }
    
    enableBlending() {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }
    
    setRotation(angle) {
        this.angle = angle;
    }
    
    getRotationMatrix() {
        const rad = this.angle * Math.PI / 180.0;
        return new Float32Array([
            Math.cos(rad), -Math.sin(rad), 0.0, 0.0,
            Math.sin(rad),  Math.cos(rad), 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
    }
    
    render(scene, camera, program) {
        if (!program) {
            console.error("❌ Renderer: programa inválido!");
            return;
        }
        
        this.clear();
        
        const gl = this.gl;
        
        // Pega os uniforms
        const modelLoc = gl.getUniformLocation(program, "model");
        const viewLoc = gl.getUniformLocation(program, "view");
        const projLoc = gl.getUniformLocation(program, "projection");
        const useTexLoc = gl.getUniformLocation(program, "uUseTexture");
        const texLoc = gl.getUniformLocation(program, "uTexture");
        const colorLoc = gl.getUniformLocation(program, "uColor");
        
        // Pega as matrizes da câmera
        const viewMatrix = camera.getViewMatrix();
        const projMatrix = camera.getProjectionMatrix();
        
        // Converte para Float32Array
        const view = this.toFloat32Array(viewMatrix);
        const proj = this.toFloat32Array(projMatrix);
        
        // Passa view e projection para o shader
        gl.uniformMatrix4fv(viewLoc, false, view);
        gl.uniformMatrix4fv(projLoc, false, proj);
        
        // Renderiza cada mesh
        for (let mesh of this.meshes) {
            if (!mesh) continue;
            
            // Pega a matriz model do objeto
            const modelMatrix = mesh.transform ? mesh.transform.getModelMatrix() : new Float32Array([
                1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1
            ]);
            
            const model = this.toFloat32Array(modelMatrix);
            gl.uniformMatrix4fv(modelLoc, false, model);
            
            // Aplica textura ou cor
            if (mesh.useTexture && mesh.texture) {
                console.log("✅ Textura aplicada!");
                mesh.texture.bind();
                gl.uniform1i(texLoc, mesh.texture.unit);
                gl.uniform1i(useTexLoc, 1);
            } else {
                gl.uniform1i(useTexLoc, 0);
                if (colorLoc && mesh.color) {
                    gl.uniform3fv(colorLoc, mesh.color.slice(0, 3));
                }
            }
            
            // Desenha
            if (mesh.draw) {
                mesh.draw();
            }
        }
    }
    
    renderRange(program, meshIndex, start, count) {
        const texPtr = this.gl.getUniformLocation(program, "tex");
        const mesh = this.meshes[meshIndex];
        const tex = this.textures[meshIndex];

        if (tex) {
            tex.bind();
            this.gl.uniform1i(texPtr, tex.unit);
        }

        mesh.drawRange(start, count);
    }
}
