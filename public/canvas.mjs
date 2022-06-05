import { NetworkManager } from "/network-manager.mjs";
import { ImageCache } from "/image-cache.mjs";
import { ElementDragger } from "/element-dragger.mjs";
import { CanvasController } from "/canvas-controller.mjs"

let canvas = document.getElementById("main-canvas");

window.nm = new NetworkManager();
await window.nm.init();

let cache = new ImageCache();

class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.x1 = x - r;
        this.y1 = y - r;
        this.x2 = x + r;
        this.y2 = y + r;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Rectangle {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    draw(ctx) {
        ctx.fillRect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    }
}

class PolyLine {
    constructor(points, width) {
        this.points = points;
        this.width = width;
        this.x1 = Infinity;
        this.y1 = Infinity;
        this.x2 = -Infinity;
        this.y2 = -Infinity;
        this.points.forEach(pt => {
            if (this.x1 > pt.x) this.x1 = pt.x;
            if (this.y1 > pt.y) this.y1 = pt.y;
            if (this.x1 < pt.x) this.x2 = pt.x;
            if (this.y2 < pt.y) this.y2 = pt.y;
        });
        this.x1 -= this.width;
        this.y1 -= this.width;
        this.x2 += this.width;
        this.y2 += this.width;
    }

    draw(ctx) {
        ctx.lineWidth = this.width;
        ctx.beginPath();
        this.points.forEach(pt => {
            ctx.lineTo(pt.x, pt.y);
        })
        ctx.stroke();
    }
}


// layer that represents vector graphics drawn on top of the grids
class ShapeLayer {
    constructor (options) {
        this.shapes = [];
        // shape interface: has properties x1, y1, x2, y2 for bounding box
        //                  also has a draw(ctx) method for drawing
        this.color = options.color || "#00000088";
        this.width = Infinity;
        this.height = Infinity;
    }

    drawRegion(ctx, x1, y1, x2, y2) {
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        let regionCenterX = (x1 + x2) / 2;
        let regionCenterY = (y1 + y2) / 2;
        this.shapes.forEach(shape => {
            let shapeCenterX = (shape.x1 + shape.x2) / 2;
            let shapeCenterY = (shape.y1 + shape.y2) / 2
            if (
                Math.abs(shapeCenterX - regionCenterX) < ((shapeCenterX - shape.x1) + (regionCenterX - x1))
                && Math.abs(shapeCenterY - regionCenterY) < ((shapeCenterY - shape.y1) + (regionCenterY - y1))
            ) {
                shape.draw(ctx);
            }
        });
    }

    draw(ctx) {
        this.shapes.forEach(shape => {
            shape.draw(ctx);
        });
    }
}

async function testingCode() {
    let createdSession = await nm.createSession("adrians session", "asdf", "zxcv");
    let joinedSession = await nm.joinSession("player", createdSession.id, "asdf", "ADRIAN");
    let battlemapAddedStatus = await nm.addBattlemap({
        imagePalette: [],
        width: 2,
        height: 2,
        tileLayers: {},
        shapeLayers: {},
        tokens: {}
    });
    nm.addImageToPalette(0, "/test1.png");
    nm.addImageToPalette(0, "/test2.png");
    console.log(nm.addTileLayer(0, 0, {
        width: 2, height: 2, images: [[0, 1], [1, 0]], order: 0
    }));
    controller.gridDrawer.activeBattlemap = 0;
}



// test (I will remove/modify later)
async function testMain() {

    // canvas and context
    let c = document.getElementById("main-canvas");
    let ctx = c.getContext("2d");

    // html element dragger
    let dragger = new ElementDragger(c);

    let session = window.nm.session;

    // thing that draws stuff on the canvas
    window.controller = new CanvasController({ canvas: c, session });
    
    controller.gridDrawer.activeBattlemap = -1;

    // test code
    await testingCode();

    async function loop() {
        await controller.draw(dragger);
        requestAnimationFrame(loop);
    }
    loop();
}

testMain();