import * as z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  // Maximum connections in the pool. Keep it below the Postgres `max_connections` limit.
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  // The least important level that is still written to the logs.
  // Production normally runs at "info". Raise it to "debug" only while investigating a problem.
  LOG_LEVEL: z
    .enum(["debug", "info", "warning", "error", "fatal"])
    .default("info"),
  // The browser origin of the web app, allowed by CORS.
  WEB_ORIGIN: z.url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    // Fail at startup with a readable list instead of a raw zod stack trace.
    const details = z.prettifyError(result.error);
    throw new Error(`Invalid environment variables:\n${details}`);
  }

  return result.data;
}

export const env = parseEnv(process.env);
