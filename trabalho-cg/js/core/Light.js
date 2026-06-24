class Light {
    constructor(position, direction, color) {
        this.position = position || [0, 0, 0];
        this.direction = direction || [0, 0, -1];
        this.color = color || [1, 1, 1];
    }
    
    setPosition(x, y, z) {
        this.position = [x, y, z];
    }
    
    setDirection(x, y, z) {
        this.direction = [x, y, z];
    }
    
    setColor(r, g, b) {
        this.color = [r, g, b];
    }
    
    getPosition() {
        return this.position;
    }
    
    getDirection() {
        return this.direction;
    }
    
    getColor() {
        return this.color;
    }
}