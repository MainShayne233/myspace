import ContentHandler from "https://deno.land/x/aqua@v1.1.4/content_handler.ts";

const port = parseInt(Deno.env.get("PORT") || "4000");
const host = Deno.env.get("HOST") || `localhost:${port}`;
const httpHeader = Deno.env.get("HTTP_HEADER") || "http://";

const server = Deno.listen({ port });

for await (const conn of server) {
  (async () => {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
      hanldeRequest(requestEvent)
    }
  })();
}

function hanldeRequest(requestEvent: Deno.RequestEvent) {
  if (removeHttpHeader(requestEvent.request.url).split("/")[0] === host) {
    redirectTo(requestEvent, `home.${host}`);
    return
  }

  const subDomain = getSubDomain(requestEvent);
  const extension = getExtension(requestEvent);
  const contentType = getContentType(extension) || "text/html";
  if (contentType === "image/gif" || contentType === "image/x-icon") {
    const fileName = getFileName(requestEvent);
    const path = `build/static/${subDomain}/assets/${fileName}`
    serveFile(requestEvent, path);
  } else if (contentType === "text/html") {
    const path = `build/static/${subDomain}/index.html`
    serveFile(requestEvent, path)
  } else if (contentType === "text/css" || contentType === "application/javascript") {
    const fileName = getFileName(requestEvent);
    const path = `build/static/${subDomain}/${fileName}`
    serveFile(requestEvent, path);
  } else {
   throw new Error("Unimplemented")
  }
}

function getContentType(extension: string) {
  return ContentHandler.getContentType(extension);
}

function getSubDomain(requestEvent: Deno.RequestEvent) {
  return removeHttpHeader(requestEvent.request.url).split(host)[0].split(".")[0]
}

function removeHttpHeader(url: string) {
  return url.replace(new RegExp("https?://"), "");
}

function getExtension(requestEvent: Deno.RequestEvent) {
  return extension(requestEvent.request.url);
}

function getFileName(requestEvent: Deno.RequestEvent) {
  const url = requestEvent.request.url
  const host = requestEvent.request.headers.get("host");

  if (url === null || host === null) {
    throw new Error("one of these is null: url: " + url + ", host: " + host);
  }

  return url.replace(new RegExp("https?://"), "").replace(host, "").split("/").slice(-1)[0];
}

function serveFile(requestEvent: Deno.RequestEvent, path: string) {
  Deno.readFile(path).then((data) => {
    requestEvent.respondWith(
      new Response(data, {
        status: 200,
        headers: {
          "Content-Type": contentType(path),
        },
      }),
    );
  }).catch((error) => {
    requestEvent.respondWith(
      new Response(error, {
        status: 400,
      }),
    );
  })
}

function redirectTo(requestEvent: Deno.RequestEvent, url: string) {
  requestEvent.respondWith(
    new Response(null, {
      status: 301,
      headers: {
      location: httpHeader + url,
      }
    }),
  );
}

function contentType(path: string) {
  const contentType = ContentHandler.getContentType(extension(path));
  if (contentType) {
    return contentType;
  } else {
    throw new Error("Could not determine content type of: " + path);
  }
}

function extension(path: string): string {
  return path.replace(
    /.*(?=\.[a-zA-Z0-9_]*$)/,
    "",
  );
}