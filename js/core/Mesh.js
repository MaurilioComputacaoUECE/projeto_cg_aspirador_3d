class Mesh {
    constructor(gl, vertices, positions, normals, texcoords, program) {
        this.gl = gl;
        this.program = program;
        this.vertices = vertices;
        this.positions = positions;      // 3 (x,y,z)
        this.normals = normals;          // 3 (nx,ny,nz)
        this.texcoords = texcoords;      // 2 (u,v)
        
        const itemSize = this.positions + this.normals + this.texcoords;
        this.buffer = new Buffer(gl, vertices, itemSize);
        this.vertexCount = this.buffer.getSize();
        this.setupAttributes();
    }
    
    setupAttributes() {
        const stride = (this.positions + this.normals + this.texcoords) * 4;
        var offset = 0;
        
        // Position (3 valores)
        const posPtr = this.gl.getAttribLocation(this.program, "position");
        this.gl.enableVertexAttribArray(posPtr);
        this.gl.vertexAttribPointer(posPtr, this.positions, this.gl.FLOAT, false, stride, offset);
        offset += this.positions * 4;
        
        // Normal (3 valores)
        const normalPtr = this.gl.getAttribLocation(this.program, "normal");
        this.gl.enableVertexAttribArray(normalPtr);
        this.gl.vertexAttribPointer(normalPtr, this.normals, this.gl.FLOAT, false, stride, offset);
        offset += this.normals * 4;
        
        // TexCoord (2 valores)
        const texPtr = this.gl.getAttribLocation(this.program, "texCoord");
        this.gl.enableVertexAttribArray(texPtr);
        this.gl.vertexAttribPointer(texPtr, this.texcoords, this.gl.FLOAT, false, stride, offset);
    }
    
    draw() {
        this.buffer.bind();
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    }
    
    drawRange(start, count) {
        this.buffer.bind();
        this.gl.drawArrays(this.gl.TRIANGLES, start, count);
    }
}