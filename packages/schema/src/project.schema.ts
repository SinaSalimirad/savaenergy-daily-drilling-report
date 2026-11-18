import * as z from "zod";

// Single source of truth for project values. The API builds its Postgres enums from these
// tuples (`pgEnum` needs a tuple, which `schema.options` is not), and the web builds its
// select lists from the same values.
export const PROJECT_STATUSES = [
  "planned",
  "active",
  "completed",
  "archived",
] as const;
export const projectStatusSchema = z.enum(PROJECT_STATUSES);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

// `archived` is excluded: a project is archived and restored only through its own endpoints,
// so `archived_at` can never disagree with `status`.
export const projectWritableStatusSchema = projectStatusSchema.exclude([
  "archived",
]);
export type ProjectWritableStatus = z.infer<typeof projectWritableStatusSchema>;

export const PROJECT_CURRENCIES = ["USD", "EUR", "IRR"] as const;
export const projectCurrencySchema = z.enum(PROJECT_CURRENCIES);
export type ProjectCurrency = z.infer<typeof projectCurrencySchema>;

const requiredText = z.string().trim().min(1).max(120);

export const projectCreateSchema = z.object({
  name: requiredText,
  operator: requiredText,
  contractor: requiredText,
  field: requiredText,
  // A whole number sent as a JSON number. No `z.coerce`: it would make the input type
  // `unknown` and the web would lose the type of this field.
  wells: z.number().int().positive(),
  status: projectWritableStatusSchema,
  currency: projectCurrencySchema,
});
export type ProjectCreate = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = projectCreateSchema
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
