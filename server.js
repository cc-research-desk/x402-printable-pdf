import { serve } from "@hono/node-server";
import { buildApp } from "./app.js";
const port = Number(process.env.PORT || 4021);
serve({ fetch: buildApp().fetch, port }); console.log(`listening on :${port}`);
