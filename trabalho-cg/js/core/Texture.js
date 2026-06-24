class Texture {
    constructor(gl, image, unit) {
        this.gl = gl;
        this.image = image;
        this.unit = unit;
        this.texture = null;
        this.create();
    }

    static createCheckerboard(gl, unit, size, colorA, colorB) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const tile = size / 8;

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                ctx.fillStyle = (x + y) % 2 === 0 ? colorA : colorB;
                ctx.fillRect(x * tile, y * tile, tile, tile);
            }
        }

        return new Texture(gl, canvas, unit);
    }

    static createFromCanvas(gl, canvas, unit) {
        return new Texture(gl, canvas, unit);
    }
    
    create() {
        this.texture = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE0 + this.unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        
        // Configurações da textura
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
    }
    
    bind() {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
}