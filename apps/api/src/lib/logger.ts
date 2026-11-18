import { AsyncLocalStorage } from "node:async_hooks";
import {
  ansiColorFormatter,
  configureSync,
  getConsoleSink,
  getLogger,
  jsonLinesFormatter,
} from "@logtape/logtape";
import { DEFAULT_REDACT_FIELDS, redactByField } from "@logtape/redaction";
import { env } from "../config/env";

// Configured once, when this file is first imported. Every other file imports `logger`
// from here, so import order does not matter. The console sink is synchronous, so there
// is nothing to flush on shutdown.
configureSync({
  sinks: {
    // Secrets must never reach the logs. Any property whose name looks sensitive (password,
    // token, authorization, ...) is replaced before the line is written. The defaults cover
    // the common names; the extra ones are specific to this API.
    console: redactByField(
      getConsoleSink({
        // Colored lines are easy to read locally. One JSON object per line is what log
        // collectors (Docker, Loki, ...) expect in production.
        formatter:
          env.NODE_ENV === "production"
            ? jsonLinesFormatter
            : ansiColorFormatter,
      }),
      {
        fieldPatterns: [
          ...DEFAULT_REDACT_FIELDS,
          /^cookie$/i,
          /^set-cookie$/i,
          /^database_?url$/i,
          /^connection_?string$/i,
        ],
        action: () => "[REDACTED]",
      },
    ),
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
  // Lets logs written inside a request handler carry that request's `requestId` without
  // passing it around. The request plugin in app.ts opens the context.
  contextLocalStorage: new AsyncLocalStorage(),
});

/**
 * Root logger. Use `logger.getChild("db")` to get one with its own category.
 *
 * Every line carries `service` and `env`, so lines from several services or environments
 * in one log collector stay apart.
 */
export const logger = getLogger(["api"]).with({
  service: "api",
  env: env.NODE_ENV,
});
