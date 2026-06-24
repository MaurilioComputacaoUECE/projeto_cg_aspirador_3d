class Plane {
    constructor(position, normal, material) {
        this.position = position || [0, -1, 0];
        this.normal = normal || [0, 1, 0];
        this.material = material || null;
    }

    getPosition() {
        return this.position;
    }

    getNormal() {
        return this.normal;
    }

    getMaterial() {
        return this.material;
    }
}