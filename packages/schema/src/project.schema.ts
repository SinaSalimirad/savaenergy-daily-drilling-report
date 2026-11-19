import * as z from "zod";

// Single source of truth for project values. The API builds its Postgres enums from these
// tuples (`pgEnum` needs a tuple, which `schema.options` is not), and the web builds its
// select lists from the same values.
//
// A project has no status column. The API derives it for reading: `archived` when
// `archived_at` is set, `active` when one of its wells is active, otherwise `inactive`.
// A client never sends it.
export const PROJECT_STATUSES = ["active", "inactive", "archived"] as const;
export const projectStatusSchema = z.enum(PROJECT_STATUSES);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const PROJECT_CURRENCIES = ["USD", "EUR", "IRR"] as const;
export const projectCurrencySchema = z.enum(PROJECT_CURRENCIES);
export type ProjectCurrency = z.infer<typeof projectCurrencySchema>;

// Messages are shown to users as they are, so they name the problem in plain words.
const requiredText = (label: string) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(120, `${label} must be 120 characters or fewer.`);

export const projectCreateSchema = z.object({
  name: requiredText("Project name"),
  operator: requiredText("Operator"),
  contractor: requiredText("Contractor"),
  field: requiredText("Field"),
  // A whole number sent as a JSON number. No `z.coerce`: it would make the input type
  // `unknown` and the web would lose the type of this field.
  wells: z
    .number({ error: "Enter the number of wells." })
    .int("Enter a whole number, for example 12.")
    .positive("Number of wells must be at least 1."),
  currency: projectCurrencySchema,
});
export type ProjectCreate = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = projectCreateSchema
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
