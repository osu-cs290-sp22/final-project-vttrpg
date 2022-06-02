import * as fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export function battlemapWrite(battlemapData) {
    let battlemapId = uuidv4();
    fs.writeFile(`../database/battlemaps/${battlemapId}.json`, JSON.stringify(battlemapData));
}