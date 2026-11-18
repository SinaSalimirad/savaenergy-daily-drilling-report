import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  // Close connections that sit idle, so a restarted database does not leave dead ones behind.
  idleTimeoutMillis: 30_000,
  // Fail a request fast when the database is unreachable instead of hanging forever.
  connectionTimeoutMillis: 5_000,
});

// An idle client can emit "error" (database restart, network drop). Without a listener
// Node treats it as an uncaught exception and kills the whole API process.
pool.on("error", (error) => {
  console.error("Unexpected error on an idle database connection", error);
});

// Must match `casing` in drizzle.config.ts, otherwise drizzle-kit generates snake_case
// columns while queries ask for camelCase ones.
export const db = drizzle(pool, { casing: "snake_case" });

export type DB = typeof db;

// The `tx` a `db.transaction(async (tx) => ...)` callback receives. Functions that must run
// inside a caller's transaction take `executor: DB | Transaction = db`.
export type Transaction = Parameters<Parameters<DB["transaction"]>[0]>[0];

/** Closes every pooled connection. Call it on shutdown and and at the end of scripts. */
export async function closeDb(): Promise<void> {
  await pool.end();
}
