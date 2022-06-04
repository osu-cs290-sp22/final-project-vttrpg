import { patchSession } from "./patch.mjs";

export class NetworkManager {
    constructor() {
        this.session = {};
    }

    async init() {
        this.mh = new MessageHandler();
        await this.mh.init();
    }

    async createSession(name, password, dmPassword) {
        let response = await this.mh.send({
            type: "CreateSession",
            name, password, dmPassword
        });
        return response;
    }

    async joinSession(connectionType, session, password, name) {
        let response = await this.mh.send({
            type: "JoinSession",
            connectionType, session, password, name
        });
        await this.updateSessionState();
        return response;
    }

    async updateSessionState() {
        this.session = await this.mh.send({
            type: "GetSession"
        });
    }

    async setTiles(battlemap, tiles) {
        let req = {
            type: "Battlemap",
            battlemap,
            request: {    
                type: "SetTiles",
                tiles
            }
        };
        patchSession(this.session, req);
        this.mh.send(req, true);
    }
}