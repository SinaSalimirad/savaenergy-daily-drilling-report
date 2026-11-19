import { dailyReportCreateSchema, dailyReportUpdateSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createDailyReportSchema = dailyReportCreateSchema;
export type CreateDailyReportInput = z.infer<typeof createDailyReportSchema>;

export const updateDailyReportSchema = dailyReportUpdateSchema;
export type UpdateDailyReportInput = z.infer<typeof updateDailyReportSchema>;

export const dailyReportIdParamsSchema = z.object({ id: z.uuid() });

export const listDailyReportsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  // Only the reports of one well. Without it, every report is listed.
  well_id: z.uuid().optional(),
  // Only the reports of the wells of one project. Combined with `well_id`, both must match.
  project_id: z.uuid().optional(),
});
export type ListDailyReportsQuery = z.infer<typeof listDailyReportsQuerySchema>;
