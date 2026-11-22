import {
  AppError,
  isCheckViolation,
  isForeignKeyViolation,
  isUniqueViolation,
  notFound,
} from "../../lib/errors";

/**
 * The write errors every fluid sample (mud, rheology, solids) has in common. `what` is the
 * name used in the messages, for example "mud sample".
 */
export function translateSampleError(error: unknown, what: string): never {
  if (isUniqueViolation(error)) {
    throw new AppError(
      409,
      "SAMPLE_NO_TAKEN",
      `This report already has a ${what} with this sample number.`,
    );
  }
  // `sample_no` is limited to 1-3: the next free number past 3 breaks that rule.
  if (isCheckViolation(error)) {
    throw new AppError(
      409,
      "SAMPLES_FULL",
      `This report already has 3 ${what}s. Remove one first.`,
    );
  }
  if (isForeignKeyViolation(error)) throw notFound("Daily report");
  throw error;
}
