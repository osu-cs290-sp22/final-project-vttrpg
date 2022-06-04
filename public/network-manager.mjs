import { patchSession } from "/patch.mjs";
import { MessageHandler } from "/message-handler.mjs"

export class NetworkManager {
    constructor() {
        this.session = {};
    }

    // asynchronous initialization (b/c constructors can't be async)
    async init() {
        this.mh = new MessageHandler("ws://localhost:3001");
        await this.mh.init();
        this.mh.onMessage(msg => {
            if (msg.fromServer) {
                patchSession(this.session, msg);
            }
        });
    }

    // create a new session
    async createSession(name, password, dmPassword) {
        let response = await this.mh.send({
            type: "CreateSession",
            name, password, dmPassword
        });
        return response;
    }

    // join a session
    async joinSession(connectionType, session, password, name) {
        let response = await this.mh.send({
            type: "JoinSession",
            connectionType, session, password, name
        });
        await this.updateSessionState();
        return response;
    }

    // update current session
    async updateSessionState() {
        // get new session data
        let newSessionData = await this.mh.send({
            type: "GetSession"
        });

        // shallow copy all properties (so that other references to the session will update)
        for (let property in this.session) {
            delete this.session[property];
        }
        for (let property in newSessionData) {
            this.session[property] = newSessionData[property];
        }
    }

    // add battlemap to session
    async addBattlemap(battlemap) {
        let request = {
            type: "AddBattlemap",
            battlemap
        };
        patchSession(this.session, request);
        let response = await this.mh.send(request);
        return response;
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