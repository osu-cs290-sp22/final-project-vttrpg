let canvas = document.getElementById("main-canvas");

// asynchronously loads an image into an imageBitmap (for canvas rendering)
async function fetchImage(url) {
    let imgReq = await fetch(url);
    let blob = await imgReq.blob();
    return createImageBitmap(blob);
}




// represents a layer of tiles on the battlemap
class TileLayer {
    constructor (options) {
        if (!options.width) throw new Error("TileLayer requires a width.");
        this.width = options.width;
        if (!options.height) throw new Error("TileLayer requires a height.");
        this.height = options.height;
        if (!options.images || !(options.images instanceof Map)) throw new Error("TileLayer requires images.");
        this.images = options.images;

        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            this.grid.push([]);
            for (let x = 0; x < this.width; x++) {
                this.grid[y].push(options.defaultTile || "");
            }
        }
    }


    // draws a region of the battlemap
    drawRegion(ctx, x, y, x2, y2) {
        this.checkTileBounds(x, y);
        this.checkTileBounds(x2 - 1, y2 - 1);
        for (let i = y; i < y2; i++) {
            for (let j = x; j < x2; j++) {
                ctx.drawImage(this.images.get(this.grid[i][j]), j, i, 1, 1);
            }
        }
    }

    // draws 1/16th of a region of the battlemap (for incremental rendering with reprojection)
    drawRegionDithered(ctx, x, y, x2, y2, index) {
        let ditherOffsetX = [0, 2, 0, 2, 1, 3, 1, 3, 0, 2, 0, 2, 1, 3, 1, 3];
        let ditherOffsetY = [0, 2, 2, 0, 1, 3, 3, 1, 1, 3, 3, 1, 0, 2, 2, 0];
        this.checkTileBounds(x, y);
        this.checkTileBounds(x2 - 1, y2 - 1);
        for (let i = Math.floor(y/4)*4 + ditherOffsetY[index]; i < y2; i+=4) {
            for (let j = Math.floor(x/4)*4 + ditherOffsetX[index]; j < x2; j+=4) {
                if (i >= y2) continue;
                if (j >= x2) continue;
                ctx.drawImage(this.images.get(this.grid[i][j]), j, i, 1, 1);
            }
        }
    }

    // draws the entire battlemap
    draw() {
        this.drawRegion(0, 0, this.width, this.height);
    }

    // checks to see if a given pair of indices corresponds to a valid tile
    checkTileBounds(x, y) {
        if (x < 0 || x >= this.width) 
            throw new Error(`Bad Tile Bounds: x = ${x} is not in the range [0, ${this.width})`);
        if (y < 0 || y >= this.height) 
            throw new Error(`Bad Tile Bounds: y = ${y} is not in the range [0, ${this.height})`);
    }

    // returns the image of a given tile
    getTileImage(x, y) {
        this.checkTileBounds(x, y);
        return this.grid[y][x];
    }

    // sets the image of a given tile
    setTileImage(x, y, image) {
        this.checkTileBounds(x, y);
        this.grid[y][x] = image;
    }
}

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





// if value > max, return max. if value < min, return min. otherwise, return value
// essentially forces a value to conform to a range
function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
}



// makes a canvas display the grids
class CanvasController {
    constructor (options) {
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
        this.layers.forEach(l => {

            // left side
            l.drawRegion(
                this.tileLayerCtx,
                clamp(Math.floor(corner1.x), 0, l.width - 1),
                clamp(Math.floor(corner1.y), 0, l.height - 1),
                clamp(Math.ceil(this.pastCorner1.x), 1, l.width),
                clamp(Math.ceil(corner2.y), 1, l.height)
            );

            // right side
            l.drawRegion(
                this.tileLayerCtx,
                clamp(Math.floor(this.pastCorner2.x), 0, l.width - 1),
                clamp(Math.floor(corner1.y), 0, l.height - 1),
                clamp(Math.ceil(corner2.x), 1, l.width),
                clamp(Math.ceil(corner2.y), 1, l.height)
            );

            // up side
            l.drawRegion(
                this.tileLayerCtx,
                clamp(Math.floor(this.pastCorner1.x), 0, l.width - 1),
                clamp(Math.floor(corner1.y), 0, l.height - 1),
                clamp(Math.ceil(this.pastCorner2.x), 1, l.width),
                clamp(Math.ceil(this.pastCorner1.y), 1, l.height)
            );

            // down side
            l.drawRegion(
                this.tileLayerCtx,
                clamp(Math.floor(this.pastCorner1.x), 0, l.width - 1),
                clamp(Math.floor(this.pastCorner2.y), 0, l.height - 1),
                clamp(Math.ceil(this.pastCorner2.x), 1, l.width),
                clamp(Math.ceil(corner2.y), 1, l.height)
            );
        });
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
        this.shapeLayers.forEach(l => {
            l.drawRegion(
                this.ctx,
                clamp(Math.floor(corner1.x), 0, l.width),
                clamp(Math.floor(corner1.y), 0, l.height),
                clamp(Math.ceil(corner2.x), 0, l.width),
                clamp(Math.ceil(corner2.y), 0, l.height)
            );
        });
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
            this.layers.forEach(l => {
                l.drawRegionDithered(
                    this.tileLayerCtx,
                    clamp(Math.floor(corner1.x), 0, l.width),
                    clamp(Math.floor(corner1.y), 0, l.height),
                    clamp(Math.ceil(corner2.x), 0, l.width),
                    clamp(Math.ceil(corner2.y), 0, l.height),
                    this.ditherIndex % 16
                );
            });
            this.ditherIndex++;
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



// implements logic for "dragging" the interior of an element
class ElementDragger {
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
            this.scale *= (1 + 0.04 * Math.sign(e.deltaY));
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


// creates a tree of HTML from a JavaScript object
function makeHTMLTree(tree) {
    if (!tree.tag) throw new Error("Cannot make an HTML tree without a tag!");
    let elem = document.createElement(tree.tag);
    if (tree.attr && tree.attr instanceof Object) {
        Object.entries(tree.attr).forEach(([key, value]) => {
            elem[key] = value;
        });
    }
    if (tree.children && tree.children instanceof Array) {
        tree.children.forEach(child => {
            if (child instanceof HTMLElement) {
                elem.appendChild(child);
            } else {
                elem.appendChild(makeHTMLTree(child));
            }
        })
    }
    return elem;
}


// test (I will remove later)
document.body.appendChild(makeHTMLTree({
    tag: "div",
    attr: {},
    children: [
        {
            tag: "p",
            attr: { innerText: "test html tree thingy" }
        },
        {
            tag: "p",
            attr: { innerText: "test html tree thingy ANOTHER THING" }
        }
    ]
}));


// test (I will remove/modify later)
async function testMain() {
    let c = document.getElementById("main-canvas");
    let ctx = c.getContext("2d");
    let imageLUT = new Map();
    let test1 = await fetchImage("/test1.png");
    let test2 = await fetchImage("/test2.png");
    let test3 = await fetchImage("/icons/Icon 1.png");
    let dragger = new ElementDragger(c);
    imageLUT.set(0, test1);
    imageLUT.set(1, test2);
    imageLUT.set(2, test3);
    let controller = new CanvasController({ canvas: c });
    for (let i = 0; i < 3; i++) {
        let tl = new TileLayer({
            width: 256,
            height: 256,
            images: imageLUT
        });
        controller.layers.push(tl);

        for (let i = 0; i < 256; i++) {
            for (let j = 0; j < 256; j++) {
                tl.grid[i][j] = Math.floor((i + j) % 3);
            }
        }
    }

    let dl = new ShapeLayer({});
    dl.shapes.push(new Circle(10, 10, 5));
    dl.shapes.push(new PolyLine([
        {x:30, y:40},
        {x:60, y:40},
        {x:80, y:60},
    ], 2));

    controller.shapeLayers.push(dl);

    function loop() {
        controller.draw(dragger);
        requestAnimationFrame(loop);
    }
    loop();
}

testMain();