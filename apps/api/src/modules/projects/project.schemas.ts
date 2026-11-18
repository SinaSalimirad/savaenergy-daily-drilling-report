import * as z from "zod";
import { PROJECT_STATUSES } from "../../db/schema";

const requiredText = z.string().trim().min(1).max(200);

// `archived` is excluded: a project is archived and restored only through its own endpoints,
// so `archived_at` can never disagree with `status`.
export const projectStatusSchema = z
  .enum(PROJECT_STATUSES)
  .exclude(["archived"]);

// `well`, `active_well`, `last_report` and `archived_*` are missing on purpose:
// the server owns them, so a client can never send them.
export const createProjectSchema = z.object({
  name: requiredText,
  operator: requiredText,
  contractor: requiredText,
  field: requiredText.nullish(),
  status: projectStatusSchema,
  // ISO 4217 code, for example "USD" or "IRR".
  currency: z.string().regex(/^[A-Z]{3}$/, "Use a 3-letter ISO currency code"),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "Send at least one field to update",
  });
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectIdParamsSchema = z.object({ id: z.uuid() });

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  // Query strings are text, so `archived=true` arrives as the string "true".
  archived: z.enum(["true", "false"]).default("false"),
});
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
