import { NetworkManager } from "/network-manager.mjs";
import { ImageCache } from "/image-cache.mjs";
import { ElementDragger } from "/element-dragger.mjs";
import { CanvasController } from "/canvas-controller.mjs"
import { TokenDrawer } from "/token-drawer.mjs"

let canvas = document.getElementById("main-canvas");



canvas.oncontextmenu = () => false;

async function fetchJSON(url) {
    return await ((await fetch(url)).json());
}

function addHTMLStringToDiv(htmlString) {
    let container = document.createElement("div");
    container.innerHTML = htmlString;
    return container;
}

async function getBattlemapFromUser() {
    let battlemaps = await fetchJSON(window.location.origin + "/battlemap");
    let mapSelect = addHTMLStringToDiv(Handlebars.partials.mapSelect(battlemaps));
    
    document.body.appendChild(mapSelect);
    return new Promise((resolve, reject) => {
        Array.from(document.getElementById("map-list").children).forEach(listItem => {
            listItem.children[0].addEventListener("click", async (e) => {
                let battlemapToLoad = e.currentTarget.innerText + ".json";
                let battlemap = await fetchJSON(
                    window.location.origin + "/battlemap/" + battlemapToLoad);
                await nm.addBattlemap(battlemap);
                document.body.removeChild(mapSelect);
                resolve();
            })
        });
    });
}

function doCreateSessionMenu() {
    let createSessionMenu = addHTMLStringToDiv(Handlebars.partials.createsession());
    document.body.appendChild(createSessionMenu);

    let sessionNameInput = document.getElementById("session-name-input");
    let passwordInput = document.getElementById("password-input");
    let dmPasswordInput = document.getElementById("dm-password-input");
    let createSessionButton = document.getElementById("create-session");

    createSessionButton.addEventListener("click", async (e) => {
        let createdSession = await nm.createSession(
            sessionNameInput.value, passwordInput.value, dmPasswordInput.value
        );
        window.location.href = window.location.origin + "/game/" + createdSession.id;
    });
}

async function doJoinSessionMenu() {
    let joinSessionMenu = addHTMLStringToDiv(Handlebars.partials.joinsession());
    document.body.appendChild(joinSessionMenu);

    let usernameInput = document.getElementById("username-input");
    let passwordInput = document.getElementById("password-input");
    let joinAsPlayerButton = document.getElementById("join-session-player");
    let joinAsDMButton = document.getElementById("join-session-dm");

    let splitPath = window.location.pathname.split("/");

    let joinAs = async (joinType) => {

        let result = await nm.joinSession(
            joinType, splitPath[2], 
            passwordInput.value, usernameInput.value
        );
        console.log(result);
        document.body.removeChild(joinSessionMenu);
        //window.alert(JSON.stringify(result));
        // controller.gridDrawer.activeBattlemap = 0;
        if (controller.session.battlemaps.length == 0) {
            await getBattlemapFromUser();
        }
        controller.gridDrawer.activeBattlemap = 0;
        td.activeBattlemap = 0;
        td.setTokens();
    }

    return new Promise((resolve, reject) => {
        joinAsPlayerButton.addEventListener("click", async (e) => {
            await joinAs("player");
            resolve();
        });
        joinAsDMButton.addEventListener("click", async (e) => {
            await joinAs("dm");
            resolve();
        });
    })
}


// test (I will remove/modify later)
async function testMain() {

    // canvas and context
    let c = document.getElementById("main-canvas");
    let ctx = c.getContext("2d");

    // html element dragger
    let dragger = new ElementDragger(c);

    window.session = {};

    // thing that draws stuff on the canvas
    window.controller = new CanvasController({ canvas: c, session });
    
    window.nm = new NetworkManager(window.controller, dragger, session);
    await window.nm.init();

    controller.gridDrawer.activeBattlemap = -1;

    window.td = new TokenDrawer(session, dragger);

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

    let tilePlaceIndex = 1;

    async function loop() {
        await controller.draw(dragger);


        if (shouldPlace) {
            let pixelSpaceCoords = dragger.pixelSpaceToWorldSpace(placePos.x, placePos.y, c);
            nm.setTiles(controller.gridDrawer.activeBattlemap, [
                {
                    layerId: "0",
                    x: Math.floor(pixelSpaceCoords.x),
                    y: Math.floor(pixelSpaceCoords.y),
                    tile: tilePlaceIndex
                }
            ]);
            await controller.draw(dragger, true);
        }
        requestAnimationFrame(loop);
    }

    let splitPath = window.location.pathname.split("/");
    if (splitPath[1] == "game") {
        if (splitPath[2]) {
            doJoinSessionMenu();
        }
    }

    if (window.location.pathname == "/") {
        doCreateSessionMenu();
    }

    let brush = document.getElementById("brush");
    brush.addEventListener("click", e => {
        if (controller.gridDrawer.activeBattlemap == -1) return;
        let imageOptions = {
            images: session.battlemaps[controller.gridDrawer.activeBattlemap].imagePalette
            .map(imageURL => {
                return {
                    image: imageURL
                }
            })
        };
        let imageSelector = addHTMLStringToDiv(Handlebars.partials.imageselector(imageOptions));
        document.body.appendChild(imageSelector);
        Array.from(document.getElementsByClassName("token_image")).forEach((image, i) => {
            image.addEventListener("click", e => {
                tilePlaceIndex = i;
            });
        }); 
    }); 

    loop();
}

testMain();