import * as z from "zod";

// A daily report has up to 3 samples of a fluid, like the 3 columns of the rig's sheet.
export const MAX_SAMPLES_PER_REPORT = 3;

export const sampleNoSchema = z
  .number({ error: "Enter the sample number, 1 to 3." })
  .int("The sample number must be a whole number.")
  .min(1, "The sample number must be at least 1.")
  .max(MAX_SAMPLES_PER_REPORT, "A report has at most 3 samples.");

// "08:30": the time the sample was taken. `null` means "not known".
export const sampleTimeSchema = z
  .string({ error: "Enter the time, for example 08:30." })
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "Use the 24-hour format, for example 08:30.",
  )
  .nullable();

/**
 * One measured value of a sample: a number from `0` to `max` with at most `decimals`
 * decimals, or `null` for "not measured".
 */
export function measurement(
  label: string,
  { max, decimals = 1 }: { max: number; decimals?: number },
) {
  const factor = 10 ** decimals;
  return z
    .number({ error: `Enter ${label} as a number.` })
    .min(0, `${label} cannot be negative.`)
    .max(max, `${label} must be ${max} or less.`)
    .refine(
      (value) => Math.abs(Math.round(value * factor) / factor - value) < 1e-9,
      {
        error:
          decimals === 0
            ? "Use a whole number."
            : `Use at most ${decimals} decimals.`,
      },
    )
    .nullable();
}

/** A percent of the volume, 0 to 100, with 1 decimal. */
export const percentMeasurement = (label: string) =>
  measurement(label, { max: 100 });

export const atLeastOneField = {
  message: "Send at least one field to update",
};
