
// called "Circle2" because apparently there's a namespace collision
type Circle2 = {
    type: "circle",
    x: number,
    y: number,
    r: number
}

type Rect = {
    type: "rectangle",
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

type Polyline = {
    type: "polyline",
    points: { x: number, y: number }[]
}

type TokenBar = {
    BarColorValue: string,
    BarName: string,
    AttributeName: string
}

type Token = {
    x: number,
    y: number,
    image: string,
    TokenName: string,
    TokenNickname: string,
    TokenDescription: string,
    TokenBar: TokenBar[]
}

type BattlemapTileLayer = {
    images: number[][] // 2D array of indexes into the imagePalette array
    width: number,
    height: number,
    order: number
}

type BattlemapShapeLayer = {
    shapes: (Circle2 | Rect | Polyline)[],
    isFogOfWar: boolean,
    order: number
}

type Battlemap = {
    imagePalette: string[], // all possible image URLs in the battlemap
    width: number, // width of battlemap in tiles
    height: number, // height of battlemap in tiles
    tileLayers: { [key: string]: BattlemapTileLayer },
    shapeLayers: { [key: string]: BattlemapShapeLayer },
    tokens: { [key: string]: Token }
}

type Session = {
    name: string,
    battlemaps: Battlemap[],
    password: string,
    dmPassword: string
}





// server request types:
type SessionRequest = 
      GetSessionRequest
    | CreateSessionRequest
    | EndSessionRequest
    | JoinSessionRequest
    | AddBattlemapRequest
    | BattlemapRequest;

type GetSessionRequest = {
    type: "GetSession",
    handle: number
}

type CreateSessionRequest = {
    type: "CreateSession",
    name: string;
    password: string;
    dmPassword: string;
    handle: number;
};

type EndSessionRequest = {
    type: "EndSession"
};

type JoinSessionRequest = {
    type: "JoinSession",
    connectionType: "player" | "dm",
    session: string,
    password: string,
    name: string,
    handle: number
}

type AddBattlemapRequest = {
    type: "AddBattlemap",
    battlemap: Battlemap
}

type BattlemapRequest = {
    type: "Battlemap",
    battlemap: number,
    request: 
          SetTilesRequest 
        | AddTileLayerRequest
        | AddShapeLayerRequest
        | RemoveLayerRequest
        | MoveLayerRequest
        | AddImageToPaletteRequest
}


// TILES AND LAYERS
type SetTilesRequest = {
    type: "SetTiles",
    tiles: ({
        x: number,
        y: number,
        tile: number,
        layerId: string
    })[]
}

type AddTileLayerRequest = {
    type: "AddTileLayer",
    layerId: string,
    layer: BattlemapTileLayer
}

type AddShapeLayerRequest = {
    type: "AddShapeLayer",
    layerId: string,
    layer: BattlemapShapeLayer
}

type RemoveLayerRequest = {
    type: "RemoveLayer",
    layerType: "tile" | "shape",
    layerId: string,
}

type MoveLayerRequest = {
    type: "MoveLayer",
    layerType: "tile" | "shape",
    src: string,
    dst: string
}

type ReorderLayerRequest = {
    type: "ReorderLayer",
    layerType: "tile" | "shape",
    layerId: string,
    order: number
}



type AddImageToPaletteRequest = {
    type: "AddImageToPalette",
    image: string
}





// TOKENS 
type SetTokenRequest = {
    type: "SetToken",
    token: Token,
    tokenId: string
}

type RemoveTokenRequest = {
    type: "RemoveToken",
    tokenId: string
}