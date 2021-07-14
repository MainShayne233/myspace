import Aqua from "https://deno.land/x/aqua/mod.ts";

const port = parseInt(Deno.env.get("PORT") || "3000");

const app = new Aqua(port);

app.get("/", (_req) => {
  return `PORT: ${port}`;
});