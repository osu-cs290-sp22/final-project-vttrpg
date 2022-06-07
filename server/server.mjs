import express from "express";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import { validate } from "./validate/schema.mjs"
import * as fs from "fs/promises";
import { battlemapWrite } from "./battlemap-crud.mjs";


const wss = new WebSocketServer({ port: process.env.WS_PORT || 3001 });

function getFailMessage(msg) {
    return JSON.stringify({
        success: false,
        reason: msg
    })
}
wss.on("connection", (ws, req) => {
    let userType;
    let session;
    let sessionID;
    let joined = false;

    ws.on("message", data => {
        // quit if session is closed prematurely
        if (joined && !activeSessions.has(sessionID)) {
            ws.send(getFailMessage("Failed to send message: Session was closed!"));
            ws.terminate();
            return;
        }

        // try to parse data request data into JSON
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch {
            ws.send(getFailMessage("Non-JSON input."));
            return;
        }

        // cannot send most types of requests if user hasn't joined a session
        if (parsedData.type != "JoinSession" && !joined) {
            ws.send(getFailMessage("Failed to send message: You haven't joined a session!"));
            return;
        }

        // request handling
        switch (parsedData.type) {

            // joining a session?
            case "JoinSession":
                // validate request format
                if (!validate.JoinSessionRequest(parsedData)) {
                    ws.send(getFailMessage("Malformed JoinSession request."));
                    return;
                };

                // validate that session to join does exist
                if (!activeSessions.has(parsedData.session)) {
                    ws.send(getFailMessage("Failed to join session: Session does not exist!"));
                    return;
                }

                sessionID = parsedData.session;
                session = activeSessions.get(parsedData.session);

                // ensure password is valid
                userType = connectionType;
                if (connectionType == "player") {
                    joined = parsedData.password == session.password;
                } else {
                    joined = parsedData.dmPassword == session.dmPassword;
                }

                // if password is invalid, notify
                if (!joined) {
                    ws.send(getFailedMessage("Failed to join session: Invalid password!"));
                    return;
                }

                ws.send({ success: true });
                break;
            case "AddBattlemap":
                // validate request format
                if (!validate.AddBattlemapRequest(parsedData)) {
                    ws.send(getFailMessage("Malformed AddBattlemap request."));
                    return;
                };


        }
    });
});

const app = express();

app.use("/session", express.json());
app.use("/battlemap", express.json());

app.use(express.static('public'));

app.get("/game/*", async (req, res) => {
    res.end(await fs.readFile("public/index.html"));
});

let activeSessions = new Map();

app.post("/battlemap", (req, res) => {
    if (!validate.Battlemap(req.body)) {
        res.statusCode = 400;
        res.end();
        return;
    }
    battlemapWrite(req.body);
});

app.post("/session", (req, res) => {
    let sessionID = uuidv4();
    if (!validate.SessionCreateInfo(req.body)) {
        res.statusCode = 400;
        res.end();
        return;
    }
    activeSessions.set(sessionID, {
        password: req.body.password,
        dmPassword: req.body.dmPassword,
        battlemaps: []
    });
    res.end(sessionID);
});

app.get("/session/:sessionID/battlemap/:index", (req, res) => {
    let sessionID = req.params.sessionID;
    let index = req.params.index;

    // ensure that session is valid
    if (!activeSessions.has(sessionID)) {
        res.statusCode = 404;
        res.end();
        return;
    }

    let session = activeSessions.get(sessionID);

    // ensure that battlemap retrieved is correct
    if (session.battlemaps[index] == undefined) {
        res.statusCode = 404;
        res.end();
        return;
    }

    // retrieve battlemap
    res.statusCode = 200;
    res.end(JSON.stringify(session.battlemaps[index]));
});

app.post("/session/:sessionID/battlemap", (req, res) => {
    // ensure that body contains a battlemap object
    if (!validate.Battlemap(req.body)) {
        res.statusCode = 400;
        res.end();
        return;
    }
    
    let sessionID = req.params.sessionID;

    // ensure that session is valid
    if (!activeSessions.has(sessionID)) {
        res.statusCode = 404;
        res.end();
        return;
    }

    let session = activeSessions.get(sessionID);
    session.battlemaps.push(req.body);
    res.end(JSON.stringify({ index: session.battlemaps.length - 1 })); 
});

app.listen(process.env.PORT || 3000);