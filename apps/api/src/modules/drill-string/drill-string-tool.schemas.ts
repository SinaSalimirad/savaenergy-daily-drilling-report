import {
  drillStringToolCreateSchema,
  drillStringToolUpdateSchema,
} from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createDrillStringToolSchema = drillStringToolCreateSchema;
export type CreateDrillStringToolInput = z.infer<
  typeof createDrillStringToolSchema
>;

export const updateDrillStringToolSchema = drillStringToolUpdateSchema;
export type UpdateDrillStringToolInput = z.infer<
  typeof updateDrillStringToolSchema
>;

export const drillStringToolIdParamsSchema = z.object({ id: z.uuid() });

// The rows are the sheet of one daily report, so the report is required.
export const listDrillStringToolsQuerySchema = z.object({
  report_id: z.uuid(),
});
export type ListDrillStringToolsQuery = z.infer<
  typeof listDrillStringToolsQuerySchema
>;
