import * as Handlebars from "handlebars";
import * as fs from "fs/promises";
import * as path from "path";

async function compile(file) {
    let filename = path.basename(file, ".handlebars") + ".js";
    await fs.writeFile(
        path.join("./public/precompiled-templates", filename), 
        `Handlebars.partials["${filename.slice(0, -3)}"] = Handlebars.template(${
            Handlebars.default.precompile((await fs.readFile(file)).toString())
        });`
    );
}

compile("handle/Tokens.handlebars");
compile("handle/partials/bar.handlebars");
compile("handle/partials/Token.handlebars");
compile("handle/partials/mapSelect.handlebars");
compile("handle/partials/createsession.handlebars");
compile("handle/partials/joinsession.handlebars");
compile("handle/partials/imageselector.handlebars");