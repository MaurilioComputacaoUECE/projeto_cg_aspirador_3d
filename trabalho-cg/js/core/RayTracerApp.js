class RayTracerApp {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.gl = null;
        this.program = null;
        this.resLoc = null;
        this.timeLoc = null;
        this.vertices = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    }

    start() {
        this.setupWebGL();
        this.setupShaders();
        this.setupGeometry();
        this.animate();
    }

    setupWebGL() {
        const canvas = document.getElementById(this.canvasId);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.gl = canvas.getContext("webgl");
        if (!this.gl) {
            alert("WebGL não suportado!");
            return;
        }
    }

    setupShaders() {
        const gl = this.gl;
        const vsSource = document.getElementById("raytracer-vertex").text;
        const fsSource = document.getElementById("raytracer-fragment").text;
        const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        this.program = createProgram(gl, vs, fs);
        gl.useProgram(this.program);
        this.resLoc = gl.getUniformLocation(this.program, "u_resolution");
        this.timeLoc = gl.getUniformLocation(this.program, "u_time");
    }

    setupGeometry() {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(this.program, "a_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    }

    animate() {
        const gl = this.gl;
        const canvas = document.getElementById(this.canvasId);
        const that = this;

        function render(time) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform2f(that.resLoc, canvas.width, canvas.height);
            gl.uniform1f(that.timeLoc, time * 0.001);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    }
}