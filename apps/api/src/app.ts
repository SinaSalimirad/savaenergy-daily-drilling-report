import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { env } from "./config/env";

// App is built separately from the server start so tests can call it without opening a port.
export const app = new Elysia()
  // The web app runs only in the browser, so it calls the API cross-origin.
  .use(cors({ origin: env.WEB_ORIGIN }))
  .get("/health", () => ({
    data: { status: "ok" },
  }));

// The web app imports only this type (never the runtime code) so Eden can infer every route.
export type App = typeof app;
