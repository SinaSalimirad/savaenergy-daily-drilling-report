import {
  productInventoryCreateSchema,
  productInventoryUpdateSchema,
} from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createInventorySchema = productInventoryCreateSchema;
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;

export const updateInventorySchema = productInventoryUpdateSchema;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

export const inventoryIdParamsSchema = z.object({ id: z.uuid() });

// The inventory is the sheet of one daily report, so the report is required.
export const listInventoryQuerySchema = z.object({ report_id: z.uuid() });
export type ListInventoryQuery = z.infer<typeof listInventoryQuerySchema>;
