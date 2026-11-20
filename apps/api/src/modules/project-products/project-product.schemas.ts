import { projectProductCreateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createProjectProductSchema = projectProductCreateSchema;
export type CreateProjectProductInput = z.infer<
  typeof createProjectProductSchema
>;

export const projectProductIdParamsSchema = z.object({ id: z.uuid() });

export const listProjectProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  // Only the products of one project. Without it, every project's products are listed.
  project_id: z.uuid().optional(), 
});
export type ListProjectProductsQuery = z.infer<
  typeof listProjectProductsQuerySchema
>;
