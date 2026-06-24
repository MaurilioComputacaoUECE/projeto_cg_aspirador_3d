class Scene {
    constructor(gl) {
        this.gl = gl;
        this.meshes = [];
        this.textures = [];
        this.spheres = [];
        this.planes = [];
        this.uniforms = {};
        this.angle = 0;
    }
    
    // Para motor 3D tradicional
    addMesh(mesh) {
        this.meshes.push(mesh);
    }
    
    addTexture(texture) {
        this.textures.push(texture);
    }
    
    // Para ray tracer
    addSphere(sphere) {
        this.spheres.push(sphere);
    }
    
    addPlane(plane) {
        this.planes.push(plane);
    }
    
    addUniform(name, value) {
        this.uniforms[name] = value;
    }
    
    getMesh(index) {
        return this.meshes[index];
    }
    
    getTexture(index) {
        return this.textures[index];
    }
    
    getSphere(index) {
        return this.spheres[index];
    }
    
    getPlane(index) {
        return this.planes[index];
    }
    
    getUniform(name) {
        return this.uniforms[name];
    }
    
    setAngle(angle) {
        this.angle = angle;
    }
    
    getAngle() {
        return this.angle;
    }
}