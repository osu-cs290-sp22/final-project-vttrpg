
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
        }
        this.wheelHandler = e => {
            this.scale *= (1 + 0.12 * Math.sign(e.deltaY));
        }
        elem.addEventListener("mousedown", this.mouseDownHandler);
        elem.addEventListener("mouseup", this.mouseUpHandler);
        elem.addEventListener("mousemove", this.mouseMoveHandler);
        elem.addEventListener("wheel", this.wheelHandler);
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


    // remove the dragger from an element
    disableDragging() {
        this.elem.removeEventListener("mousedown", this.mouseDownHandler);
        this.elem.removeEventListener("mouseup", this.mouseUpHandler);
        this.elem.removeEventListener("mousemove", this.mouseMoveHandler);
        this.elem.removeEventListener("wheel", this.wheelHandler);
    }
}

