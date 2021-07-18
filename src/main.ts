import Aqua, { Request, Response } from "https://deno.land/x/aqua/mod.ts";
import ContentHandler from "https://deno.land/x/aqua@v1.1.4/content_handler.ts";

const port = parseInt(Deno.env.get("PORT") || "4000");

const app = new Aqua(port);

app.get("/", (_req) => {
  return { redirect: "/home" };
});

app.get(new RegExp("\/(home|hi)"), async (req) => {
  const [page] = req.matches;
  const path = "build/static/" + page + "/index.html";
  return await app.render(path);
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


app.register((req, res) => {
  const contentType = ContentHandler.getContentType(extension(req.url));
  if (contentType) {
  return { ...res, headers: { ...res.headers, "Content-Type": contentType}};
  } else {
    return res;
  }
});

function extension(path: string): string {
  return path.replace(
    /.*(?=\.[a-zA-Z0-9_]*$)/,
    "",
  );
}

function staticPathForPage(req: Request) {
  return "build/static" +
    req.headers.referer.replace(new RegExp("https?://"), "").replace(
      req.headers.host,
      "",
    );
}
