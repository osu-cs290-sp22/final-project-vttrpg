import { NetworkManager } from "/network-manager.mjs";
import { ImageCache } from "/image-cache.mjs";
import { ElementDragger } from "/element-dragger.mjs";
import { CanvasController } from "/canvas-controller.mjs"

let canvas = document.getElementById("main-canvas");

canvas.oncontextmenu = () => false;


window.addBattlemapToSession =  async function() {
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
    let images = [];
    for (let y = 0; y < 32; y++) {
        images.push([]);
        for (let x = 0; x < 32; x++) {
            images[y].push(0);
        }
    }
    console.log(nm.addTileLayer(0, "0", {
        width: 32, height: 32, images, order: 0
    }));
    controller.gridDrawer.activeBattlemap = 0;
    return createdSession;
}
window.joinSession = async function(id) {
    let joinedSession = await nm.joinSession("player", id, "asdf", "ADRIAN222");
    controller.gridDrawer.activeBattlemap = 0;

}



// test (I will remove/modify later)
async function testMain() {

    // canvas and context
    let c = document.getElementById("main-canvas");
    let ctx = c.getContext("2d");

    // html element dragger
    let dragger = new ElementDragger(c);

    let session = {};

    // thing that draws stuff on the canvas
    window.controller = new CanvasController({ canvas: c, session });
    
    window.nm = new NetworkManager(window.controller, dragger, session);
    await window.nm.init();

    controller.gridDrawer.activeBattlemap = -1;

    // test code
    //await testingCode();

    let shouldPlace = false;
    let placePos = { x: 0, y: 0}

    canvas.addEventListener("mousedown", e => {
        if (e.button == 2) shouldPlace = true;
    });
    canvas.addEventListener("mouseup", e => {
        if (e.button == 2) shouldPlace = false;
    });
    canvas.addEventListener("mousemove", e => {
        placePos = {
            x: e.clientX,
            y: e.clientY
        };
    });

    async function loop() {
        await controller.draw(dragger);


        if (shouldPlace) {
            let pixelSpaceCoords = dragger.pixelSpaceToWorldSpace(placePos.x, placePos.y, c);
            nm.setTiles(controller.gridDrawer.activeBattlemap, [
                {
                    layerId: "0",
                    x: Math.floor(pixelSpaceCoords.x),
                    y: Math.floor(pixelSpaceCoords.y),
                    tile: 1
                }
            ]);
            await controller.draw(dragger, true);
        }
        requestAnimationFrame(loop);
    }

    let splitPath = window.location.pathname.split("/");
    if (splitPath[1] == "game") {
        if (splitPath[2]) {

            // TODO: replace with a GUI
            let joinType;
            while (joinType != "player" && joinType != "dm") {
                joinType = window.prompt("Join as DM or player? (enter 'player' or 'dm')");
            }
            let username = window.prompt("Enter username.");
            let password = window.prompt("Enter password.");
            let result = await nm.joinSession(joinType, splitPath[2], password, username);
            window.alert(JSON.stringify(result));
            controller.gridDrawer.activeBattlemap = 0;
        }
    }

    if (window.location.pathname == "/") {

        // TODO: replace with a GUI
        console.log(splitPath);
        let sessionName = window.prompt("Create new session: Session name:");
        let playerPassword = window.prompt("Player password:");
        let dmPassword = window.prompt("DM password:");
        let createdSession = await nm.createSession(sessionName, playerPassword, dmPassword);
        window.location.href = window.location.origin + "/game/" + createdSession.id;
    }

    loop();
}

testMain();