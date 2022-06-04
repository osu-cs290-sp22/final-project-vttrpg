import { GridDrawer } from "/grid-drawer.mjs";

// makes a canvas display the grids
export class CanvasController {
    constructor (options) {
        if (!options.session) throw new Error("CanvasController requires a session.");
        this.session = options.session;
        this.gridDrawer = new GridDrawer(this.session);
        if (!options.canvas) throw new Error("CanvasController requires a canvas.");
        this.canvas = options.canvas;
        this.ctx = this.canvas.getContext("2d");
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
            this.gridDrawer.drawRegionOfTilesDithered(
                this.tileLayerCtx,
                Math.floor(corner1.x),
                Math.floor(corner1.y),
                Math.ceil(corner2.x),
                Math.ceil(corner2.y),
                this.ditherIndex % 16
            );
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


