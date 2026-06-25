class Camera {
    constructor(fovy, aspect, near, far) {
        this.fovy = fovy;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = [0, 0, 0];
        this.target = [0, 0, -1];
        this.up = [0, 1, 0];
        this.rotation = [0, 0, 0];
    }

    setPosition(x, y, z) {
        this.position = [x, y, z];
    }

    setTarget(x, y, z) {
        this.target = [x, y, z];
    }

    getProjectionMatrix() {
        const fovy = this.fovy * Math.PI / 180.0;
        const fy = 1 / Math.tan(fovy / 2.0);
        const fx = fy / this.aspect;
        const B = -2 * this.far * this.near / (this.far - this.near);
        const A = -(this.far + this.near) / (this.far - this.near);

        return new Float32Array([
            fx, 0,  0, 0,
            0,  fy, 0, 0,
            0,  0,  A, -1,
            0,  0,  B, 0
        ]);
    }

    getViewMatrix() {
        const ex = this.position[0], ey = this.position[1], ez = this.position[2];
        const cx = this.target[0], cy = this.target[1], cz = this.target[2];
        const ux = this.up[0], uy = this.up[1], uz = this.up[2];

        let zx = ex - cx, zy = ey - cy, zz = ez - cz;
        let len = Math.hypot(zx, zy, zz);
        if (len < 1e-6) { zx = 0; zy = 0; zz = 1; len = 1; }
        zx /= len; zy /= len; zz /= len;

        let xx = uy * zz - uz * zy;
        let xy = uz * zx - ux * zz;
        let xz = ux * zy - uy * zx;
        len = Math.hypot(xx, xy, xz);
        if (len < 1e-6) { xx = 1; xy = 0; xz = 0; len = 1; }
        xx /= len; xy /= len; xz /= len;

        const yx = zy * xz - zz * xy;
        const yy = zz * xx - zx * xz;
        const yz = zx * xy - zy * xx;

        return new Float32Array([
            xx, yx, zx, 0,
            xy, yy, zy, 0,
            xz, yz, zz, 0,
            -(xx * ex + xy * ey + xz * ez),
            -(yx * ex + yy * ey + yz * ez),
            -(zx * ex + zy * ey + zz * ez),
            1
        ]);
    }
}

function matrixToFloat32ColumnMajor(matrix) {
    if (matrix instanceof Float32Array) return matrix;

    if (matrix && matrix._data) {
        const data = matrix._data;
        const out = new Float32Array(16);
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                out[col * 4 + row] = data[row][col];
            }
        }
        return out;
    }

    return new Float32Array(16);
}
