import express from "express";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import { validate } from "./validate/schema.mjs"
import * as fs from "fs/promises";
import { patchSession } from "../public/patch.mjs";
import * as bodyParser from "body-parser";
import * as path from "path";


const wss = new WebSocketServer({ port: process.env.WS_PORT || 3001 });

function getFailMessage(handle, msg) {
    return JSON.stringify({
        success: false,
        reason: msg,
        handle
    })
}
wss.on("connection", (ws, req) => {
    let userType;
    let session;
    let sessionID;
    let joined = false;

    ws.on("message", data => {
        // try to parse data request data into JSON
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch {
            ws.send(getFailMessage(parsedData.handle, "Non-JSON input."));
            return;
        }

        // quit if data is malformed
        if (!validate.SessionRequest(parsedData)) {
            console.log("Recieved malformed data.");
            ws.send(getFailMessage(parsedData.handle, "Malformed request!"));
            return;
        }

        // quit if session is closed prematurely
        if (joined && !activeSessions.has(sessionID)) {
            ws.send(getFailMessage(parsedData.handle, "Failed to send message: Session was closed!"));
            ws.terminate();
            return;
        }

        // cannot send most types of requests if user hasn't joined a session
        if (parsedData.type != "JoinSession" && parsedData.type != "CreateSession" && !joined) {
            ws.send(getFailMessage(parsedData.handle, "Failed to send message: You haven't joined a session!"));
            return;
        }

        // request handling
        switch (parsedData.type) {
            case "GetSession":
                ws.send(JSON.stringify({
                    battlemaps: session.battlemaps,
                    name: session.name,
                    members: session.members.map(member => member.name),
                    handle: parsedData.handle
                }));
                break;
            // creating a session?
            case "CreateSession":
                let createdSessionID = uuidv4();
                // create new session
                activeSessions.set(createdSessionID, {
                    password: parsedData.password,
                    dmPassword: parsedData.dmPassword,
                    name: parsedData.name,
                    battlemaps: [],
                    members: [],
                });

                // send session data reply
                ws.send(JSON.stringify({
                    id: createdSessionID,
                    handle: parsedData.handle
                }));
                break;
            
                // joining a session?
            case "JoinSession":
                // validate that session to join does exist
                if (!activeSessions.has(parsedData.session)) {
                    ws.send(getFailMessage(parsedData.handle, "Failed to join session: Session does not exist!"));
                    return;
                }

                sessionID = parsedData.session;
                session = activeSessions.get(parsedData.session);

                // ensure password is valid
                userType = parsedData.connectionType;
                if (parsedData.connectionType == "player") {
                    joined = parsedData.password == session.password;
                } else {
                    joined = parsedData.password == session.dmPassword;
                }

                // if password is invalid, notify
                if (!joined) {
                    ws.send(getFailMessage(parsedData.handle, "Failed to join session: Invalid password!"));
                    return;
                }

                session.members.push({
                    ws,
                    name: parsedData.name,
                });
                ws.send(JSON.stringify({ success: true,
                    handle: parsedData.handle }));
                break;

            case "AddBattlemap":
            case "Battlemap":
                patchSession(session, parsedData);
                ws.send(JSON.stringify({ success: true,
                    handle: parsedData.handle }));
                session.members.forEach(member => {
                    if (ws !== member.ws) 
                        member.ws.send(JSON.stringify({ fromServer: true, ...parsedData }));
                });
                break;
        }
    });
});

const app = express();

app.use(express.static('public'));

app.get("/battlemap", async (req, res) => {
    let fileNames = await fs.readdir("./battlemap");
    res.end(JSON.stringify(
        {
            maps: fileNames.map(e => {
                return { name: path.basename(e, ".json") };
            })
        }
    ));
});
app.get("/battlemap/*", express.static('./'));

app.get("/game/*", async (req, res) => {
    res.end(await fs.readFile("public/index.html"));
});

app.post("/battlemap/:battlemapName", bodyParser.default.text());
app.post("/battlemap/:battlemapName", async (req, res) => {
    let filePath = path.join(process.cwd(), req.url);
    try {
        let exists = await fs.access(filePath);
        res.statusCode = 400;
        res.end();
    } catch {
        await fs.writeFile(filePath, req.body);
        res.end();
    }
})

let activeSessions = new Map();

app.listen(process.env.PORT || 3000);