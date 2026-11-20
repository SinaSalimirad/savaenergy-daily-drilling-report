import * as z from "zod";

export const PUMP_TYPES = ["triplex", "duplex"] as const;
export const pumpTypeSchema = z.enum(PUMP_TYPES);
export type PumpType = z.infer<typeof pumpTypeSchema>;

// Cubic inches in one US gallon.
const CUBIC_INCHES_PER_GALLON = 231;
// A triplex pump has three single-acting pistons: every stroke empties three liners.
const TRIPLEX_PISTONS = 3;
// A duplex pump has two double-acting cylinders.
const DUPLEX_CYLINDERS = 2;

/**
 * Pump output in gallons per stroke, with the efficiency already applied.
 *
 * Triplex: 3 x (pi / 4 x liner² x stroke) / 231 x efficiency. A 6" liner with a 12" stroke at
 * 95 % gives 4.19 gal/stroke, which is what the rig's sheet shows.
 *
 * Duplex: two double-acting cylinders, and the rod takes room on the back stroke:
 * 2 x (pi / 4 x stroke x (2 x liner² - rod²)) / 231 x efficiency.
 *
 * Returns `null` for a duplex without a rod diameter: a number would be a guess.
 */
export function galPerStroke(pump: {
  type: PumpType;
  liner_diameter: number;
  stroke_length: number;
  efficiency: number;
  rod_diameter?: number | null;
}): number | null {
  const efficiency = pump.efficiency / 100;
  const area = Math.PI / 4;
  if (pump.type === "triplex") {
    const linerVolume = area * pump.liner_diameter ** 2 * pump.stroke_length;
    return (
      ((TRIPLEX_PISTONS * linerVolume) / CUBIC_INCHES_PER_GALLON) * efficiency
    );
  }
  if (pump.rod_diameter == null) return null;
  const cylinderVolume =
    area *
    pump.stroke_length *
    (2 * pump.liner_diameter ** 2 - pump.rod_diameter ** 2);
  return (
    ((DUPLEX_CYLINDERS * cylinderVolume) / CUBIC_INCHES_PER_GALLON) * efficiency
  );
}

// Inches, up to the 3 decimals the database column holds (numeric(5, 3)).
const inches = (label: string, max: number) =>
  z
    .number({ error: `Enter the ${label}, for example 6.5.` })
    .positive(`The ${label} must be more than 0.`)
    .max(max, `The ${label} must be ${max} inches or less.`)
    .refine((value) => Math.round(value * 1000) / 1000 === value, {
      error: "Use at most 3 decimals.",
    });

const pumpFields = z.object({
  project_id: z.uuid("Choose a project."),
  // The position of the pump in the project, starting at 1. A project cannot have two pumps
  // with the same order. Left out on create, the API uses the next free number.
  order: z
    .number({ error: "Enter a whole number, for example 1." })
    .int("Enter a whole number, for example 1.")
    .min(1, "Order must be at least 1.")
    .max(1000, "Order must be 1000 or less."),
  model: z
    .string({ error: "Enter the pump model." })
    .trim()
    .min(1, "Enter the pump model.")
    .max(100, "The model must be 100 characters or fewer."),
  type: pumpTypeSchema,
  // Only a duplex pump uses it (the rod takes room in the cylinder). `null` clears it.
  rod_diameter: inches("rod diameter", 10).nullable().optional(),
  liner_diameter: inches("liner diameter", 20),
  stroke_length: inches("stroke length", 30),
  // A percentage, 97.5 means 97.5 %. Stored as numeric(5, 2).
  efficiency: z
    .number({ error: "Enter the efficiency, for example 95." })
    .positive("Efficiency must be more than 0.")
    .max(100, "Efficiency must be 100 or less.")
    .refine((value) => Math.round(value * 100) / 100 === value, {
      error: "Use at most 2 decimals.",
    }),
});

export const pumpCreateSchema = pumpFields
  .partial({ order: true })
  .refine((pump) => pump.type !== "duplex" || pump.rod_diameter != null, {
    path: ["rod_diameter"],
    error: "A duplex pump needs a rod diameter.",
  })
  .refine(
    (pump) =>
      pump.rod_diameter == null || pump.rod_diameter < pump.liner_diameter,
    {
      path: ["rod_diameter"],
      error: "The rod must be thinner than the liner.",
    },
  );
export type PumpCreate = z.infer<typeof pumpCreateSchema>;

// No `.default()` anywhere: inside `.partial()` it would fill missing fields in a patch and
// overwrite stored values.
export const pumpUpdateSchema = pumpFields
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type PumpUpdate = z.infer<typeof pumpUpdateSchema>;
