import Ajv from "ajv";
import * as TJS from "typescript-json-schema";
import * as path from "path";
import * as url from "url";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

const ajv = new Ajv();

export let validate = {};

// const battlemapCreateInfoSchema = TJS.generateSchema(
//     TJS.getProgramFromFiles([path.join(dirname, "./schema.ts")]),
//     "BattlemapCreateInfo"
// );

[
    "SessionCreateInfo", 
    "Battlemap", 
    "Session", 
    "JoinSessionRequest",
    "AddBattlemapRequest",
    "BattlemapRequest"
].forEach(elem => {
    validate[elem] = ajv.compile(TJS.generateSchema(
        TJS.getProgramFromFiles([path.join(dirname, "./schema.ts")]),
        elem
    ));
})

//export const validateBattlemapCreateInfo = ajv.compile(battlemapCreateInfoSchema);


