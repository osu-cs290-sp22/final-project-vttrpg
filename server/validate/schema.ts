type SessionCreateInfo = {
    name: string;
    password: string;
    dmPassword: string;
};

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

type Token = {
    x: number,
    y: number,
    image: string,
    stats: number[]
    maxStats: number[]
}

type BattlemapTileLayer = {
    images: number[][] // 2D array of indexes into the imagePalette array
}

type BattlemapShapeLayer = {
    shapes: (Circle2 | Rect | Polyline)[],
    isFogOfWar: boolean
}

type Battlemap = {
    imagePalette: string[], // all possible image URLs in the battlemap
    width: number, // width of battlemap in tiles
    height: number, // height of battlemap in tiles
    tileLayers: BattlemapTileLayer[],
    shapeLayers: BattlemapShapeLayer[],
    tokens: Token[]
}

type Session = {
    name: string,
    battlemaps: Battlemap[],
    password: string,
    dmPassword: string
}





// server request types:
type JoinSessionRequest = {
    type: "JoinSession",
    connectionType: "player" | "dm",
    session: string,
    password: string
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

type SetTilesRequest = {
    type: "SetTiles",
    x: number[],
    y: number[],
    tile: number[]
}

type AddTileLayerRequest = {
    type: "AddTileLayer",
    position: number,
    layer: BattlemapTileLayer
}

type AddShapeLayerRequest = {
    type: "AddShapeLayer",
    position: number,
    layer: BattlemapShapeLayer
}

type RemoveLayerRequest = {
    type: "RemoveLayer",
    layerType: "tile" | "shape",
    position: number
}

type MoveLayerRequest = {
    type: "RemoveLayer",
    layerType: "tile" | "shape",
    src: number,
    dst: number
}

type AddImageToPaletteRequest = {
    type: "AddImageToPalette",
    image: string
}