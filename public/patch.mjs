export function patchSession(session, patch) {
    switch (patch.type) {
    case "AddBattlemap":
        session.battlemaps.push(patch.battlemap);
        break;
    case "Battlemap":
        patchBattlemap(session.battlemaps[patch.battlemap], patch.request);
        break;
    }
}

function isBetween(target, min, max) {
    return target >= min && target <= max;
}

function patchBattlemap(battlemap, patch) {
    switch (patch.type) {
    case "SetTiles":
        patch.tiles.forEach(tile => {
            let layer = battlemap.tileLayers[tile.layer];
            if (    layer
                 && isBetween(tile.x, 0, layer.width - 1)
                 && isBetween(tile.y, 0, layer.height - 1)) {
                layer.images[tile.y][tile.x] = tile.tile
            }
        });
        break;
    
    case "AddTileLayer":
        if (isBetween(patch.position, 0, battlemap.tileLayers.length - 1)) {
            battlemap.tileLayers.splice(patch.position, 0, patch.layer);
        }
        break;

    case "AddShapeLayer":
        if (isBetween(patch.position, 0, battlemap.shapeLayers.length - 1)) {
            battlemap.shapeLayers.splice(patch.position, 0, patch.layer);
        }
        break;
    
    case "RemoveLayer":
        let layerList = (patch.layerType == "tile") ? battlemap.tileLayers : battlemap.shapeLayers;
        if (isBetween(patch.position, 0, layerList.length - 1)) {
            layerList.splice(patch.position, 1);
        }
        break;

    case "MoveLayer":
        let layerList2 = (patch.layerType == "tile") ? battlemap.tileLayers : battlemap.shapeLayers;
        if (isBetween(patch.src, 0, layerList2.length - 1) && isBetween(patch.dst, 0, layerList2.length - 1)) {
            layerList2.splice(patch.dst, 0, layerList2[patch.src]);
            layerList2.splice(patch.src, 1);
        }
        break;

    case "AddImageToPalette":
        battlemap.imagePalette.push(patch.image);    
        break;
    }
}