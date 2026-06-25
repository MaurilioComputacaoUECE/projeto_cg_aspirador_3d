class Sphere {
    constructor(center, radius, material) {
        this.center = center || [0, 0, 0];
        this.radius = radius || 1.0;
        this.material = material || null;
    }

    getCenter() {
        return this.center;
    }

    getRadius() {
        return this.radius;
    }

    getMaterial() {
        return this.material;
    }
}