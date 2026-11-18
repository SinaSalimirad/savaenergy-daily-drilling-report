import { join } from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { logger } from "../lib/logger";
import { closeDb, db } from "./index";

// Applies the committed SQL files in ./migrations. It uses drizzle-orm only (not drizzle-kit),
// so it also runs inside the production image, which installs no dev dependencies.
try {
  await migrate(db, { migrationsFolder: join(import.meta.dir, "migrations") });
  logger.info("Migrations applied");
} catch (error) {
  logger.error("Migration failed", { error });
  process.exitCode = 1;
} finally {
  // Without this the open pool keeps the process alive after the work is done.
  await closeDb();
}
