import { productInputSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
// Create and update both send a whole product: the kind decides which fields apply.
export const createProductSchema = productInputSchema;
export const updateProductSchema = productInputSchema;
export type ProductInputBody = z.infer<typeof productInputSchema>;

export const productIdParamsSchema = z.object({ id: z.uuid() });

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
