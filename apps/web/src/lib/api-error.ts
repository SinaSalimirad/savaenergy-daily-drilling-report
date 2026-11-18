/** An error response from the API: `{ code, message, errors? }` plus the HTTP status. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type EdenFailure = { status: number; value: unknown };

function isErrorBody(
  value: unknown,
): value is { code: string; message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    typeof value.code === "string" &&
    typeof value.message === "string"
  );
}

// Eden returns `{ data, error }` instead of throwing. React Query needs a thrown error to
// mark a query or mutation as failed, so every call goes through one of these two helpers.
function toApiError({ status, value }: EdenFailure): ApiError {
  if (isErrorBody(value))
    return new ApiError(status, value.code, value.message);
  return new ApiError(status, "UNKNOWN_ERROR", "Something went wrong.");
}

export function unwrap<T>(result: {
  data: T | null;
  error: EdenFailure | null;
}): T {
  if (result.error) throw toApiError(result.error);
  // `data` is only null when `error` is set, which is handled above.
  return result.data as T;
}

/** For endpoints with no body in the response, such as DELETE (204). */
export function ensureOk(result: { error: EdenFailure | null }): void {
  if (result.error) throw toApiError(result.error);
}
