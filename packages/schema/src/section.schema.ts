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

export const HOLE_TYPES = [
  "conductor",
  "casing",
  "liner",
  "open_hole",
] as const;
export const holeTypeSchema = z.enum(HOLE_TYPES);
export type HoleType = z.infer<typeof holeTypeSchema>;

const sectionFields = z.object({
  well_id: z.uuid("Choose a well."),
  // The position of the section in the well, starting at 1. A well cannot have two sections
  // with the same order. Left out on create, the API uses the next free number.
  sort_order: z
    .number({ error: "Enter a whole number, for example 1." })
    .int("Enter a whole number, for example 1.")
    .min(1, "Order must be at least 1.")
    .max(1000, "Order must be 1000 or less."),
  hole_size: holeSizeSchema,
  // Optional fields accept `null` too, so an edit can clear them. No `.default()`: inside
  // `.partial()` it would fill missing fields in a patch and overwrite stored values.
  hole_type: holeTypeSchema.nullable().optional(),
});

export const sectionCreateSchema = sectionFields.partial({
  sort_order: true,
});
export type SectionCreate = z.infer<typeof sectionCreateSchema>;

export const sectionUpdateSchema = sectionFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type SectionUpdate = z.infer<typeof sectionUpdateSchema>;
