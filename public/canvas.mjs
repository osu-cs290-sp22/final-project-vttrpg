import { NetworkManager } from "/network-manager.mjs";
import { ImageCache } from "./image-cache.mjs";
import { ElementDragger } from "./element-dragger.mjs";

let canvas = document.getElementById("main-canvas");

let nm = new NetworkManager();

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

class GridDrawer {
    constructor (session) {
        this.session = session;
        this.activeBattlemap = -1;
        this.cache = new ImageCache();
    }

    async drawRegionOfTiles(ctx, x1, y1, x2, y2) {
        if (this.activeBattlemap == -1) return;
        for (let layer of this.session.battlemaps[this.activeBattlemap].tileLayers) {
            let xmin = clamp(x1, 0, layer.width);
            let ymin = clamp(y1, 0, layer.height);
            let xmax = clamp(x2, 0, layer.width);
            let ymax = clamp(y2, 0, layer.height);
            for (let y = ymin; y < ymax; y++) {
                for (let x = xmin; x < xmax; x++) {
                    let imgUrl = this.session.battlemaps[this.activeBattlemap].imagePalette[layer.images[y][x]];
                    ctx.drawImage(await this.cache.get(imgUrl), x, y, 1, 1);
                }
            }
        }
    }
}



// if value > max, return max. if value < min, return min. otherwise, return value
// essentially forces a value to conform to a range
function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
}



// makes a canvas display the grids
class CanvasController {
    constructor (options) {
        if (!options.session) throw new Error("CanvasController requires a session.");
        this.session = options.session;
        this.gridDrawer = new GridDrawer(this.session);
        if (!options.canvas) throw new Error("CanvasController requires a canvas.");
        this.canvas = options.canvas;
        this.ctx = canvas.getContext("2d");
        this.layers = [];
        this.shapeLayers = [];
        this.pastPosition = { x: -99999, y: -99999 };
        this.pastScale = 9999;
        this.pastCorner1 = { x: -9999, y: -9999 };
        this.pastCorner2 = { x: -9998, y: -9998 };
        this.scaleAtLastRender = 9999999;
        this.ditherIndex = 0;

        this.tileLayerCanvas = document.createElement("canvas");
        this.tileLayerCtx = this.tileLayerCanvas.getContext("2d");
        this.redrawNeeded = true;

        this.resizeHandler = e => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.tileLayerCanvas.width = window.innerWidth;
            this.tileLayerCanvas.height = window.innerHeight;
            this.redrawNeeded = true;
        };
        this.resizeHandler();
        window.addEventListener("resize", this.resizeHandler);
    }



    // reproject previous frame onto current frame for fast execution
    reproject(dragger) { 
        this.tileLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
        let reprojectedPos1 = worldSpaceToPixelSpace(
            this.pastCorner1.x, this.pastCorner1.y, this.canvas, dragger.scale,
            dragger.position.x, dragger.position.y
        );
        let reprojectedPos2 = worldSpaceToPixelSpace(
            this.pastCorner2.x, this.pastCorner2.y, this.canvas, dragger.scale,
            dragger.position.x, dragger.position.y
        );
        this.tileLayerCtx.drawImage(this.tileLayerCanvas, 
            reprojectedPos1.x,
            reprojectedPos1.y,
            reprojectedPos2.x - reprojectedPos1.x,
            reprojectedPos2.y - reprojectedPos1.y
        );
        let corner1 = dragger.pixelSpaceToWorldSpace(0, 0, this.canvas);
        let corner2 = dragger.pixelSpaceToWorldSpace(this.canvas.width, this.canvas.height, this.canvas);
        dragger.applyTransforms(this.tileLayerCanvas, this.tileLayerCtx);
        //this.layers.forEach(l => {

            // left side
            this.gridDrawer.drawRegionOfTiles(
                this.tileLayerCtx,
                Math.floor(corner1.x),
                Math.floor(corner1.y),
                Math.ceil(this.pastCorner1.x),
                Math.ceil(corner2.y)
            );

            // right side
            this.gridDrawer.drawRegionOfTiles(
                this.tileLayerCtx,
                Math.floor(this.pastCorner2.x),
                Math.floor(corner1.y),
                Math.ceil(corner2.x),
                Math.ceil(corner2.y)
            );

            // up side
            this.gridDrawer.drawRegionOfTiles(
                this.tileLayerCtx,
                Math.floor(this.pastCorner1.x),
                Math.floor(corner1.y),
                Math.ceil(this.pastCorner2.x), 
                Math.ceil(this.pastCorner1.y)
            );

            // down side
            this.gridDrawer.drawRegionOfTiles(
                this.tileLayerCtx,
                Math.floor(this.pastCorner1.x),
                Math.floor(this.pastCorner2.y),
                Math.ceil(this.pastCorner2.x),
                Math.ceil(corner2.y)
            );
        //});
    }


    // updates "previous position" variables for reprojection purposes
    updatePosition(dragger) {
        let corner1 = dragger.pixelSpaceToWorldSpace(0, 0, this.canvas);
        let corner2 = dragger.pixelSpaceToWorldSpace(this.canvas.width, this.canvas.height, this.canvas);
        this.pastCorner1 = { x: corner1.x, y: corner1.y };
        this.pastCorner2 = { x: corner2.x, y: corner2.y };
        this.pastPosition = { x: dragger.position.x, y: dragger.position.y };
        this.pastScale = dragger.scale;
    }


    drawTilesOntoMainCanvas(dragger, corner1, corner2) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.ctx.drawImage(this.tileLayerCanvas, 0, 0);

        dragger.applyTransforms(this.canvas, this.ctx);
        // this.shapeLayers.forEach(l => {
        //     l.drawRegion(
        //         this.ctx,
        //         clamp(Math.floor(corner1.x), 0, l.width),
        //         clamp(Math.floor(corner1.y), 0, l.height),
        //         clamp(Math.ceil(corner2.x), 0, l.width),
        //         clamp(Math.ceil(corner2.y), 0, l.height)
        //     );
        // });
        this.updatePosition(dragger);
    }


    // draws a single frame
    draw(dragger) {
        if (
            !this.redrawNeeded 
            && this.pastPosition.x == dragger.position.x 
            && this.pastPosition.y == dragger.position.y 
            && this.scaleAtLastRender == dragger.scale) return;
        this.reproject(dragger);

        let corner1 = dragger.pixelSpaceToWorldSpace(0, 0, this.canvas);
        let corner2 = dragger.pixelSpaceToWorldSpace(this.canvas.width, this.canvas.height, this.canvas);

        this.drawTilesOntoMainCanvas(dragger, corner1, corner2);
        if (!this.redrawNeeded && this.scaleAtLastRender == dragger.scale) return;

        this.scaleAtLastRender = dragger.scale;
        this.tileLayerCtx.setTransform(1, 0, 0, 1, 0, 0);

        dragger.applyTransforms(this.tileLayerCanvas, this.tileLayerCtx);
        let repeat = this.redrawNeeded ? 16 : (dragger.scale > 20 ? 4 : 1);

        for (let i = 0; i < repeat; i++) {
            //this.layers.forEach(l => {
                // l.drawRegionDithered(
                //     this.tileLayerCtx,
                //     clamp(Math.floor(corner1.x), 0, l.width),
                //     clamp(Math.floor(corner1.y), 0, l.height),
                //     clamp(Math.ceil(corner2.x), 0, l.width),
                //     clamp(Math.ceil(corner2.y), 0, l.height),
                //     this.ditherIndex % 16
                // );
            //});
            //this.ditherIndex++;
            this.gridDrawer.drawRegionOfTiles(
                this.tileLayerCtx,
                Math.floor(corner1.x),
                Math.floor(corner1.y),
                Math.ceil(corner2.x),
                Math.ceil(corner2.y)
            );
        }

        this.redrawNeeded = false;

        this.updatePosition(dragger);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTilesOntoMainCanvas(dragger, corner1, corner2);
    }


    disableController() {
        window.removeEventListener("resize", this.resizeHandler);
    }
}


// converts coordinates on the game board to pixel coordinates on the screen
function worldSpaceToPixelSpace(x, y, c, scale, posx, posy) {
    x -= posx;
    y -= posy;
    x *= scale;
    y *= scale;
    x += c.width / 2;
    y += c.height / 2;
    return { x, y };
}




// test (I will remove/modify later)
async function testMain() {

    // canvas and context
    let c = document.getElementById("main-canvas");
    let ctx = c.getContext("2d");

    // html element dragger
    let dragger = new ElementDragger(c);

    let session = {
        name: "Test Session",
        battlemaps: [
            {
                imagePalette: ["/test1.png", "/test2.png", "/icons/Icon 1.png"],
                width: 4,
                height: 4,
                tileLayers: [
                    {
                        images: [
                            [0, 1, 2, 1],
                            [2, 1, 0, 1],
                            [0, 1, 0, 1],
                            [2, 1, 1, 2],
                        ],
                        width: 4,
                        height: 4
                    }
                ],
                shapeLayers: [],
                tokens: []
            }
        ]
    }

    // thing that draws stuff on the canvas
    let controller = new CanvasController({ canvas: c, session });
    
    controller.gridDrawer.activeBattlemap = 0;

    async function loop() {
        await controller.draw(dragger);
        requestAnimationFrame(loop);
    }
    loop();
}

testMain();