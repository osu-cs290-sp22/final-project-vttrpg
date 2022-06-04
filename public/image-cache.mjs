
// asynchronously loads an image into an imageBitmap (for canvas rendering)
async function fetchImage(url) {
    let imgReq = await fetch(url);
    let blob = await imgReq.blob();
    return createImageBitmap(blob);
}


export class ImageCache {
    constructor() {
        this.cache = {};
    }

    async get(url) {
        if (!this.cache.hasOwnProperty(url)) {
            this.cache[url] = await fetchImage(url);
        }
        return this.cache[url];
    }
}