import { app } from "./app";
import { env } from "./config/env";
import { closeDb } from "./db";

app.listen(env.API_PORT);
console.log(`API listening on http://localhost:${env.API_PORT}`);

// Docker sends SIGTERM on stop: stop taking requests first, then release the connections.
async function shutdown(): Promise<void> {
  await app.stop();
  await closeDb();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
