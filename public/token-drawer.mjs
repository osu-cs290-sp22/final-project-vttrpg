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
    }

    setTokens() {
        // if there's no battlemap, then return
        if (this.activeBattlemap == -1) return;
        
        // get rid of all tokens
        while (tokensContainer.children.length != 0) 
            tokensContainer.removeChild(tokensContainer.lastElementChild);

        // load in all tokens
        Object.entries(this.session.battlemaps[this.activeBattlemap].tokens).forEach(([tokenId, token]) => {    
            let img = document.createElement("img");
            img.src = token.image;
            img.style.position = "absolute";
            img.style.zIndex = 5;
            let moveListener = () => {
                let pixelSpacePos = this.dragger.worldSpaceToPixelSpace(token.x, token.y, this.dragger.elem);
                img.style.left = `${pixelSpacePos.x}px`;
                img.style.top = `${pixelSpacePos.y}px`;
                img.style.width = `${this.dragger.scale}px`;
                img.style.height = `${this.dragger.scale}px`;
            };
            moveListener();
            this.dragger.addOnMove(moveListener);
            tokensContainer.appendChild(img);
            let imgClickListener = (e) => {
            
                if (this.currentlySetTokenMenu) {
                    document.body.removeChild(this.currentlySetTokenMenu);
                }
                let tokenMenu = addHTMLStringToDiv(Handlebars.partials.Token(token));
                tokenMenu.style.position = "absolute";
                tokenMenu.style.bottom = "0";
                tokenMenu.style.height = "50%";
                tokenMenu.style.zIndex = "6";
                document.body.appendChild(tokenMenu);
                this.currentlySetTokenMenu = tokenMenu;
            
                let submitButton = document.getElementById("token-submit");
                submitButton.addEventListener("click", async (event) => {
                    let tokenPatch = {
                        TokenName: document.getElementById("token-name-input").value,
                        TokenNickname: document.getElementById("token-nickname-input").value,
                        TokenDescription: document.getElementById("token-description-input").value
                    };

                    Object.keys(tokenPatch).forEach(key => {
                        if (tokenPatch[key] == "") {
                            tokenPatch[key] = token[key];
                        }
                    });

                    let newToken = {
                        ...token,
                        ...tokenPatch
                    };
                    
                    console.log(newToken);
                    await nm.setToken(this.activeBattlemap, tokenId, newToken);
                    imgClickListener();
                });
            
            }
            img.addEventListener("click", imgClickListener);
        });
    }
}