AFRAME.registerComponent('canvas-material', {
    schema: {
        width: {
            type: 'int',
            default: 512
        },
        height: {
            type: 'int',
            default: 512
        },
        color: {
            type: 'color',
            default: 'yellow'
        },
        text: {
            type: 'string'
        },
        fontSize: {
            type: 'int',
            default: 36
        }, 
        textColor: {
            type: 'string',
            default: 'black'
        }
    },



    init() {
        if (!this.canvas) {
            this.canvas = document.createElement("canvas");
        }

        this.texture = new THREE.CanvasTexture(this.canvas);
        this.material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true });
        var _this = this;
        this.canvas.width = this.data.width;
        this.canvas.height = this.data.height;

        const ctx = this.canvas.getContext("2d");
        ctx.fillStyle = this.data.color;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.getContext = function() {
            const ctx = _this.canvas.getContext("2d");
            return ctx;
        }

        this.updateTexture = function() {
            this.texture.needsUpdate = true;
        }

        this.clearContext = function() {
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.texture.needsUpdate = true;
        }

        if (this.data.text) {

            let textSize = this.data.fontSize
            let moreToWrite = this.data.text
            let writeNow
            let yOffset = textSize
            let numberChars = this.data.width/this.data.fontSize
            while(moreToWrite){
                console.log(moreToWrite)
                writeNow = moreToWrite.slice(0,numberChars)
                moreToWrite = moreToWrite.slice(numberChars)
                ctx.font = `${this.data.fontSize}px Courier`
                ctx.fillStyle = this.data.textColor
                ctx.fillText(writeNow, textSize, yOffset)
                yOffset += textSize
            }
        }

        var event = new Event("loaded")
        document.dispatchEvent(event)
    },

    update() {
        var _this = this;

        // HACK: adding timeout because child[0] not immediately available
        setTimeout(function() {
            if (_this.el.object3D.children[0]) {
                _this.el.object3D.children[0].material = _this.material;

            } else {
                console.log("in else from object3d")
            }
        }, 100);
    }
});
