import * as Handlebars from "handlebars";
import * as fs from "fs/promises";
import * as path from "path";

async function compile(file) {
    let filename = path.basename(file);
    await fs.writeFile(
        path.join("./public/precompiled-templates", filename), 
        Handlebars.default.precompile((await fs.readFile(file)).toString())
    );
}

compile("handle/Tokens.handlebars");
compile("handle/partials/bar.handlebars");
compile("handle/partials/Token.handlebars");