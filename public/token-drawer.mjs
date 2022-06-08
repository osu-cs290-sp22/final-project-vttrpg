let tokensContainer = document.getElementById("token-list");

function addHTMLStringToDiv(htmlString) {
    let container = document.createElement("div");
    container.innerHTML = htmlString;
    return container;
}

export class TokenDrawer {
    constructor(session, dragger) {
        this.session = session;
        this.dragger = dragger;
        this.activeBattlemap = -1;
        this.currentlySetTokenMenu = undefined;
        this.tokenMoveListeners= [];
        this.mouseUpListeners= [];
        this.mouseMoveListeners= [];
        document.getElementById("tokens").addEventListener("click", e => {
            if (!this.session.battlemaps || !this.session.battlemaps[0]) return;
            nm.setToken(this.activeBattlemap, Math.random().toString(), {
                x: 1, y: 1,
                image: `/icons/Icon ${Math.floor(Math.random() * 16) + 1}.png`,
                TokenName: "name",
                TokenNickname: "nickname",
                TokenDescription: "desc",
                TokenBar: []
            });
            this.setTokens();
        });
        // update token if remote changes occur
        nm.mh.onMessage(msg => {
            if (
                msg.type == "Battlemap" 
                && (msg.request.type == "SetToken"
                || msg.request.type == "RemoveToken")
            ) {
                this.setTokens();
            }
        });
    }

    setTokens() {
        // if there's no battlemap, then return
        if (this.activeBattlemap == -1) return;
        
        // get rid of all tokens
        while (tokensContainer.children.length != 0) 
            tokensContainer.removeChild(tokensContainer.lastElementChild);

        // load in all tokens
        let tokens = this.session.battlemaps[this.activeBattlemap].tokens;
        let activeTokenId = undefined;
        this.tokenMoveListeners.forEach(listener => {
            this.dragger.removeOnMove(listener);
        });
        this.mouseUpListeners.forEach(listener => {
            document.removeEventListener("mouseup", listener);
        });
        this.mouseMoveListeners.forEach(listener => {
            document.removeEventListener("mousemove", listener);
        });
        this.tokenMoveListeners = [];
        this.mouseUpListeners = [];
        this.mouseMoveListeners = [];
        Object.keys(tokens).forEach((tokenId) => {    

            // create images for tokens
            let img = document.createElement("img");
            img.oncontextmenu = e => false;
            img.setAttribute('draggable', false);
            img.src = tokens[tokenId].image;
            img.style.position = "absolute";
            img.style.zIndex = 5;


            // move and scale the tokens appropriately according to grid
            let moveListener = () => {
                let pixelSpacePos = this.dragger.worldSpaceToPixelSpace(tokens[tokenId].x, tokens[tokenId].y, this.dragger.elem);
                img.style.left = `${pixelSpacePos.x}px`;
                img.style.top = `${pixelSpacePos.y}px`;
                img.style.width = `${this.dragger.scale}px`;
                img.style.height = `${this.dragger.scale}px`;
            };
            moveListener();
            this.dragger.addOnMove(moveListener);
            this.tokenMoveListeners.push(moveListener);

            // open menu when token clicked
            tokensContainer.appendChild(img);
            let imgClickListener = (e) => {
                activeTokenId = tokenId;

                // delete old menu from DOM
                if (this.currentlySetTokenMenu) {
                    document.body.removeChild(this.currentlySetTokenMenu);
                    this.currentlySetTokenMenu = undefined;
                }

                // create token menu
                let tokenMenu = addHTMLStringToDiv(Handlebars.partials.Token(tokens[tokenId]));
                tokenMenu.style.position = "absolute";
                tokenMenu.style.top = "0";
                tokenMenu.style.right = "0";
                tokenMenu.style.height = "100%";
                tokenMenu.style.zIndex = "6";
                tokenMenu.style.overflow = "scroll";
                document.body.appendChild(tokenMenu);
                this.currentlySetTokenMenu = tokenMenu;
            
                let closeButton = document.getElementById("token-close");
                closeButton.addEventListener("click", event => {
                    document.body.removeChild(this.currentlySetTokenMenu);
                    this.currentlySetTokenMenu = undefined;
                    activeTokenId = undefined;
                });
                
                // make submit button submit token
                let submitButton = document.getElementById("token-submit");
                submitButton.addEventListener("click", async (event) => {
                    
                    // fields to change in token
                    let tokenPatch = {
                        TokenName: document.getElementById("token-name-input").value,
                        TokenNickname: document.getElementById("token-nickname-input").value,
                        TokenDescription: document.getElementById("token-description-input").value
                    };

                    // delete blank fields
                    Object.keys(tokenPatch).forEach(key => {
                        if (tokenPatch[key] == "") {
                            tokenPatch[key] = tokens[tokenId][key];
                        }
                    });

                    // construct new token
                    let newToken = {
                        ...(tokens[tokenId]),
                        ...tokenPatch
                    };
                    
                    // set token both locally and remotely
                    nm.setToken(this.activeBattlemap, tokenId, newToken);
                    imgClickListener();
                });

                let deleteButton = document.getElementById("delete-token");
                deleteButton.addEventListener("click", async (event) => {
                    nm.removeToken(this.activeBattlemap, tokenId);
                    document.body.removeChild(this.currentlySetTokenMenu);
                    this.currentlySetTokenMenu = undefined;
                    activeTokenId = undefined;
                    this.setTokens();
                });
            
            }
            img.addEventListener("click", imgClickListener);

            // if (activeTokenId == tokenId) {
            //     imgClickListener();
            // }

            let isMouseDown = false;
            let deltaX = 0;
            let deltaY = 0;

            img.addEventListener("mousedown", e => {
                if (e.button == 2) isMouseDown = true;
            });
            let mouseUp = e => {
                isMouseDown = false;
                let newToken = {
                    ...(tokens[tokenId]),
                    x: tokens[tokenId].x + deltaX / this.dragger.scale,
                    y: tokens[tokenId].y + deltaY / this.dragger.scale
                };

                // set token both locally and remotely
                nm.setToken(this.activeBattlemap, tokenId, newToken);
                moveListener();

                deltaX = 0;
                deltaY = 0;
            }

            document.addEventListener("mouseup", mouseUp);
            this.mouseUpListeners.push(mouseUp);
            //img.addEventListener("mouseleave", mouseUp);

            let mouseMove = e => {
                if (isMouseDown) {
                    deltaX += e.movementX;
                    deltaY += e.movementY;

                    let pixelSpacePos = this.dragger.worldSpaceToPixelSpace(
                        tokens[tokenId].x + deltaX / this.dragger.scale, 
                        tokens[tokenId].y + deltaY / this.dragger.scale, this.dragger.elem);
                    img.style.left = `${pixelSpacePos.x}px`;
                    img.style.top = `${pixelSpacePos.y}px`;
                }
            }

            document.addEventListener("mousemove", mouseMove);
            this.mouseMoveListeners.push(mouseMove);




        });
    }
}