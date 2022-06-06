
// implements logic for "dragging" the interior of an element
export class ElementDragger {
    constructor (elem) {
        let mouseDown = false;
        this.position = { x: 0, y: 0 };
        this.scale = 16;
        this.elem = elem;
        this.mouseDownHandler = e => {
            if (e.button == 0) mouseDown = true;
        }
        this.mouseUpHandler = e => {
            if (e.button == 0) mouseDown = false;
        }
        this.mouseMoveHandler = e => {
            if (mouseDown) {
                this.position = {
                    x: this.position.x - e.movementX / this.scale,
                    y: this.position.y - e.movementY / this.scale
                };
            }
            this.onMoveCallbacks.forEach(callback => callback());
        }
        this.onMoveCallbacks = [];
        this.wheelHandler = e => {
            this.scale *= (1 + 0.12 * Math.sign(e.deltaY));
            this.onMoveCallbacks.forEach(callback => callback());
        }
        elem.addEventListener("mousedown", this.mouseDownHandler);
        elem.addEventListener("mouseup", this.mouseUpHandler);
        elem.addEventListener("mousemove", this.mouseMoveHandler);
        elem.addEventListener("wheel", this.wheelHandler);
    }

    addOnMove(callback) {
        this.onMoveCallbacks.push(callback);
    }

    removeOnMove(callback) {
        this.onMoveCallbacks = this.onMoveCallbacks.filter(c => c !== callback);
    }

    // apply the transformations of the dragger to a given canvas
    applyTransforms(c, ctx) {
        ctx.translate(c.width / 2, c.height / 2);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-this.position.x, -this.position.y);
    }


    // convert pixel coordinates to coordinates within the dragger's world
    pixelSpaceToWorldSpace(x, y, c) {
        x -= c.width / 2;
        y -= c.height / 2;
        x /= this.scale;
        y /= this.scale;
        x += this.position.x
        y += this.position.y
        return { x, y };
    }

    worldSpaceToPixelSpace(x, y, c) {
        x -= this.position.x;
        y -= this.position.y;
        x *= this.scale;
        y *= this.scale;
        x += c.width / 2;
        y += c.height / 2;
        return { x, y };
    }
    

    // remove the dragger from an element
    disableDragging() {
        this.elem.removeEventListener("mousedown", this.mouseDownHandler);
        this.elem.removeEventListener("mouseup", this.mouseUpHandler);
        this.elem.removeEventListener("mousemove", this.mouseMoveHandler);
        this.elem.removeEventListener("wheel", this.wheelHandler);
    }
}

