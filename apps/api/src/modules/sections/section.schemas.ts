import { sectionCreateSchema, sectionUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createSectionSchema = sectionCreateSchema;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;

export const updateSectionSchema = sectionUpdateSchema;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;

// Move a section to the place of another one. Its order is the target, and the sections in
// between move one step the other way, so the orders of a well stay unique.
export const moveSectionSchema = z.object({
  to_order: z.number().int().min(1).max(1000),
});
export type MoveSectionInput = z.infer<typeof moveSectionSchema>;

export const sectionIdParamsSchema = z.object({ id: z.uuid() });

export const listSectionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  // Only the sections of one well. Without it, every section is listed.
  well_id: z.uuid().optional(),
});
export type ListSectionsQuery = z.infer<typeof listSectionsQuerySchema>;
