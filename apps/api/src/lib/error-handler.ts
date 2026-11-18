import { Elysia } from "elysia";
import { AppError, type ErrorBody } from "./errors";
import { logger } from "./logger";

/** Turns every error into `{ code, message, errors? }`. Internals never reach the client. */
export const errorHandler = new Elysia({ name: "error-handler" }).onError(
  { as: "global" },
  ({ code, error, request, set }): ErrorBody => {
    if (error instanceof AppError) {
      set.status = error.status;
      return { code: error.code, message: error.message };
    }

    if (code === "VALIDATION") {
      set.status = 422;
      return {
        code: "VALIDATION_ERROR",
        message: "The request is not valid.",
        errors: error.all.map((issue) => ({
          path: "path" in issue ? String(issue.path) : "",
          message: issue.message,
        })),
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { code: "NOT_FOUND", message: "Route not found." };
    }

    // The real error is logged for us. The client only learns that something broke.
    logger.error("Unhandled error on {method} {path}", {
      error,
      method: request.method,
      path: new URL(request.url).pathname,
    });
    set.status = 500;
    return { code: "INTERNAL_ERROR", message: "Something went wrong." };
  },
);
