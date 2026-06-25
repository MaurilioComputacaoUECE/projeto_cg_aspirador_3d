class Buffer {
    constructor(gl, data, itemSize) {
        this.gl = gl;
        this.itemSize = itemSize;
        this.data = data;
        this.buffer = null;
        this.create();
    }
    
    create() {
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data, this.gl.STATIC_DRAW);
    }
    
    bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }
    
    getSize() {
        return this.data.length / this.itemSize;
    }
}