import { ImageCache } from "/image-cache.mjs"

// if value > max, return max. if value < min, return min. otherwise, return value
// essentially forces a value to conform to a range
function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
}

export class GridDrawer {
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

    async drawRegionOfTilesDithered(ctx, x1, y1, x2, y2, ditherFactor) {
        if (this.activeBattlemap == -1) return;
        for (let layer of this.session.battlemaps[this.activeBattlemap].tileLayers) {
            let ditherOffsetX = [0, 2, 0, 2, 1, 3, 1, 3, 0, 2, 0, 2, 1, 3, 1, 3][ditherFactor];
            let ditherOffsetY = [0, 2, 2, 0, 1, 3, 3, 1, 1, 3, 3, 1, 0, 2, 2, 0][ditherFactor];
            let xmin = clamp(Math.floor(x1 / 4) * 4, 0, layer.width) + ditherOffsetX;
            let ymin = clamp(Math.floor(y1 / 4) * 4, 0, layer.height) + ditherOffsetY;
            let xmax = clamp(x2, 0, layer.width);
            let ymax = clamp(y2, 0, layer.height);
            for (let y = ymin; y < ymax; y+=4) {
                for (let x = xmin; x < xmax; x+=4) {
                    let imgUrl = this.session.battlemaps[this.activeBattlemap].imagePalette[layer.images[y][x]];
                    ctx.drawImage(await this.cache.get(imgUrl), x, y, 1, 1);
                }
            }
        }
    }
}
