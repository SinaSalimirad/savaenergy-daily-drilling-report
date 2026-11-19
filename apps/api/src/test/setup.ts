import { join } from "node:path";

// Tests wipe tables between runs, so they must never touch the development database.
const url =
  process.env.TEST_DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/sava_drilling_api_test";

if (!new URL(url).pathname.endsWith("_test")) {
  throw new Error(
    `Refusing to run tests on "${url}": the database name must end with "_test".`,
  );
}

// Creates the test database on first run, so a fresh checkout needs no manual step.
// The name is checked above, so it is safe to put in the statement.
const { Client } = await import("pg");
const admin = new Client({
  connectionString: Object.assign(new URL(url), { pathname: "/postgres" }).href,
});
await admin.connect();
const dbName = new URL(url).pathname.slice(1);
const { rowCount } = await admin.query(
  "select 1 from pg_database where datname = $1",
  [dbName],
);
if (!rowCount) await admin.query(`create database "${dbName}"`);
await admin.end();

// Set before `config/env` is loaded, because it reads process.env once when first imported.
process.env.DATABASE_URL = url;
// `bun test` sets NODE_ENV to "test", which the env schema does not accept.
process.env.NODE_ENV = "development";
// A request line per call would bury the test output.
process.env.LOG_LEVEL = "fatal";

// Imported here, not at the top: static imports run before the lines above.
const { migrate } = await import("drizzle-orm/node-postgres/migrator");
const { db } = await import("../db");

await migrate(db, {
  migrationsFolder: join(import.meta.dir, "../db/migrations"),
});
