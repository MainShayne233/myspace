import Aqua, { Request } from "https://deno.land/x/aqua/mod.ts";

export default async function(req: Request, app: Aqua) {
    return await app.render("build/static/home/index.html")
}