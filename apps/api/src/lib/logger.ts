import {
  ansiColorFormatter,
  configureSync,
  getConsoleSink,
  getLogger,
  jsonLinesFormatter,
} from "@logtape/logtape";
import { env } from "../config/env";

// Configured once, when this file is first imported. Every other file imports `logger`
// from here, so import order does not matter. The console sink is synchronous, so there
// is nothing to flush on shutdown.
configureSync({
  sinks: {
    console: getConsoleSink({
      // Colored lines are easy to read locally. One JSON object per line is what log
      // collectors (Docker, Loki, ...) expect in production.
      formatter:
        env.NODE_ENV === "production" ? jsonLinesFormatter : ansiColorFormatter,
    }),
  },
  loggers: [
    { category: ["api"], lowestLevel: env.LOG_LEVEL, sinks: ["console"] },
    // LogTape's own warnings (a failing sink, for example). Without this entry they are dropped.
    {
      category: ["logtape", "meta"],
      lowestLevel: "warning",
      sinks: ["console"],
    },
  ],
});

/** Root logger. Use `logger.getChild("db")` to get one with its own category. */
export const logger = getLogger(["api"]);
