class Transform {
    constructor() {
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0]; // [x, y, z] em graus
        this.scale = [1, 1, 1];
    }
    
    setPosition(x, y, z) {
        this.position = [x, y, z];
    }
    
    setRotation(x, y, z) {
        this.rotation = [x, y, z];
    }
    
    setScale(x, y, z) {
        this.scale = [x, y, z];
    }
    
    getRotationMatrixX(angle) {
        var rad = angle * Math.PI / 180.0;
        return math.matrix([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, Math.cos(rad), -Math.sin(rad), 0.0],
            [0.0, Math.sin(rad), Math.cos(rad), 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ]);
    }
    
    getRotationMatrixY(angle) {
        var rad = angle * Math.PI / 180.0;
        return math.matrix([
            [Math.cos(rad), 0.0, -Math.sin(rad), 0.0],
            [0.0, 1.0, 0.0, 0.0],
            [Math.sin(rad), 0.0, Math.cos(rad), 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ]);
    }
    
    getRotationMatrixZ(angle) {
        var rad = angle * Math.PI / 180.0;
        return math.matrix([
            [Math.cos(rad), -Math.sin(rad), 0.0, 0.0],
            [Math.sin(rad), Math.cos(rad), 0.0, 0.0],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ]);
    }
    
    getTranslationMatrix() {
        var x = this.position[0];
        var y = this.position[1];
        var z = this.position[2];
        return math.matrix([
            [1, 0, 0, x],
            [0, 1, 0, y],
            [0, 0, 1, z],
            [0, 0, 0, 1]
        ]);
    }
    
    getScaleMatrix() {
        var x = this.scale[0];
        var y = this.scale[1];
        var z = this.scale[2];
        return math.matrix([
            [x, 0, 0, 0],
            [0, y, 0, 0],
            [0, 0, z, 0],
            [0, 0, 0, 1]
        ]);
    }
    
    getModelMatrix() {
        var rotX = this.getRotationMatrixX(this.rotation[0]);
        var rotY = this.getRotationMatrixY(this.rotation[1]);
        var rotZ = this.getRotationMatrixZ(this.rotation[2]);
        var rot = math.multiply(rotY, rotX);
        rot = math.multiply(rotZ, rot);
        
        var model = math.multiply(this.getTranslationMatrix(), rot);
        model = math.multiply(model, this.getScaleMatrix());
        
        return model;
    }
}