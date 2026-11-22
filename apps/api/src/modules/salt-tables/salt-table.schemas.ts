import { saltTypeSchema } from "schema";
import * as z from "zod";

export const listSaltTableQuerySchema = z.object({
  // One salt per request: its table has at most 40 rows, so there is no pagination.
  salt_type: saltTypeSchema,
});
export type ListSaltTableQuery = z.infer<typeof listSaltTableQuerySchema>;
