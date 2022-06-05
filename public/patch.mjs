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
        battlemap.tileLayers[patch.layerId] = patch.layer;
        break;

    case "AddShapeLayer":
        battlemap.shapeLayers[patch.layerId] = patch.layer;
        break;
    
    case "RemoveLayer":
        let layerList = (patch.layerType == "tile") ? battlemap.tileLayers : battlemap.shapeLayers;
        delete layerList[patch.layerId];
        break;

    case "MoveLayer":
        let layerList2 = (patch.layerType == "tile") ? battlemap.tileLayers : battlemap.shapeLayers;
        layerList2[patch.dst] = layerList2[patch.src];
        delete patch.src;
        break;
    
    case "ReorderLayer":
        let layerList3 = (patch.layerType == "tile") ? battlemap.tileLayers : battlemap.shapeLayers;
        let layer = layerList3[patch.layerId];
        if (!layer) break;
        layer.order = patch.order;

    case "AddImageToPalette":
        battlemap.imagePalette.push(patch.image);    
        break;
    }
}