import * as z from "zod";

// Standard borehole sizes in inches, as decimals. Every fraction is a multiple of 1/8,
// so each value is exact in binary and in Postgres numeric(5, 3).
export const HOLE_SIZES = [
  3.75, 4, 4.75, 5.875, 6, 6.125, 6.5, 7.875, 8.5, 8.75, 9.5, 10.625, 12.25,
  14.5, 14.75, 16, 17.5, 20, 24, 26,
] as const;

export const holeSizeSchema = z
  .number({ error: "Choose a hole size." })
  .refine((size) => (HOLE_SIZES as readonly number[]).includes(size), {
    error: "Choose a standard hole size.",
  });
export type HoleSize = (typeof HOLE_SIZES)[number];

/** `5.875` -> `5 7/8"`, `16` -> `16"`. */
export function formatHoleSize(size: number): string {
  const whole = Math.floor(size);
  const eighths = Math.round((size - whole) * 8);
  if (eighths === 0) return `${whole}"`;
  const gcd = eighths % 4 === 0 ? 4 : eighths % 2 === 0 ? 2 : 1;
  return `${whole} ${eighths / gcd}/${8 / gcd}"`;
}
