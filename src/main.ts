import Aqua, { Request, Response } from "https://deno.land/x/aqua/mod.ts";
import home from "./pages/home/main.ts";

const port = parseInt(Deno.env.get("PORT") || "4000");

const app = new Aqua(port);

app.get("/", (_req) => {
  return { redirect: "/home" };
});

app.get("/home", (req) => home(req, app));

app.get("/style.min.css", (_req) => {
  return "";
});

app.get(new RegExp("/(script|style).min\.(.*)\.(js|css)"), async (req) => {
  const [type, key, ext] = req.matches;
  const staticPath = staticPathForPage(req);
  const path = staticPath + "/" + type + ".min." + key + "." + ext;
  return await app.render(path);
});

app.get("/assets/:asset", async (req) => {
  const staticPath = staticPathForPage(req);
  const path = staticPath + "/assets/" + req.parameters.asset;
  const res = await app.render(path);
  return res;
});

function staticPathForPage(req: Request) {
  return "build/static" +
    req.headers.referer.replace(new RegExp("https?://"), "").replace(
      req.headers.host,
      "",
    );
}
