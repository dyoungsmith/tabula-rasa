AFRAME.registerComponent('canvas-material', {
    schema: {
        width: {
            type: 'int',
            default: 500
        },
        height: {
            type: 'int',
            default: 500
        },
        color: {
            type: 'color',
            default: '#000000'
        }
    },
    init: function() {
        if (!this.canvas) {
            this.canvas = document.createElement("canvas");
        }

        this.texture = new THREE.CanvasTexture(this.canvas);
        this.material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true });
        var _this = this;
        this.canvas.width = this.data.width;
        this.canvas.height = this.data.height;
        const ctx = this.canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.getContext = function() {
            var ctx = _this.canvas.getContext("2d");
            return ctx;
        }

        this.updateTexture = function() {
            this.texture.needsUpdate = true;
        }

        var event = new Event("loaded")
        document.dispatchEvent(event)
    },
    update: function() {
        var _this = this;

        // HACK:adding timeout because child[0] not immediately available
        setTimeout(function() {
            if (_this.el.object3D.children[0]) {
                _this.el.object3D.children[0].material = _this.material;

            } else {
                console.log("in else from object3d")
            }
        }, 100);
    }
});
