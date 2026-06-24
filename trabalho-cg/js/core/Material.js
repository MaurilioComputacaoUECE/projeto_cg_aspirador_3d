class Material {
    constructor(options) {
        this.color = options.color || [1, 1, 1];
        this.reflective = options.reflective || 0.0;
        this.specular = options.specular || 0.0;
        this.shininess = options.shininess || 32.0;
    }

    getColor() {
        return this.color;
    }

    isReflective() {
        return this.reflective > 0.0;
    }

    getReflectivity() {
        return this.reflective;
    }
}