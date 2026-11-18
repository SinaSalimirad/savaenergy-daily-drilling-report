import { DrizzleQueryError } from "drizzle-orm";

export type ErrorStatus = 400 | 404 | 409;

/** An error the client is allowed to see. Anything else becomes a generic 500. */
export class AppError extends Error {
  constructor(
    readonly status: ErrorStatus,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (what: string) =>
  new AppError(404, "NOT_FOUND", `${what} was not found.`);

/** Body of every failed response: `{ code, message, errors? }`. */
export type ErrorBody = {
  code: string;
  message: string;
  errors?: { path: string; message: string }[];
};

/** Postgres error codes we map to HTTP errors. */
const UNIQUE_VIOLATION = "23505";

// Drizzle wraps the driver error in a DrizzleQueryError, so the Postgres code is on `cause`.
function postgresCode(error: unknown): string | undefined {
  const source = error instanceof DrizzleQueryError ? error.cause : error;
  if (typeof source === "object" && source !== null && "code" in source) {
    return String(source.code);
  }
  return undefined;
}

export function isUniqueViolation(error: unknown): boolean {
  return postgresCode(error) === UNIQUE_VIOLATION;
}
