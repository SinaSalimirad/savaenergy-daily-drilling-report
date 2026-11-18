import { projectCreateSchema, projectUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
// `archived_*` are missing on purpose: the server owns them, so a client can never send them.
export const createProjectSchema = projectCreateSchema;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = projectUpdateSchema;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// Only HTTP details stay here: they are not part of the contract the web form shares.
export const projectIdParamsSchema = z.object({ id: z.uuid() });

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  // Query strings are text, so `archived=true` arrives as the string "true".
  archived: z.enum(["true", "false"]).default("false"),
});
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
