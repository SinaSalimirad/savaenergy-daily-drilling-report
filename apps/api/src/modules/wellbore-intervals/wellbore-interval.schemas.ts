import {
  wellboreIntervalCreateSchema,
  wellboreIntervalUpdateSchema,
} from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const createWellboreIntervalSchema = wellboreIntervalCreateSchema;
export type CreateWellboreIntervalInput = z.infer<
  typeof createWellboreIntervalSchema
>;

export const updateWellboreIntervalSchema = wellboreIntervalUpdateSchema;
export type UpdateWellboreIntervalInput = z.infer<
  typeof updateWellboreIntervalSchema
>;

export const wellboreIntervalIdParamsSchema = z.object({ id: z.uuid() });

// The rows are the sheet of one daily report, so the report is required.
export const listWellboreIntervalsQuerySchema = z.object({
  report_id: z.uuid(),
});
export type ListWellboreIntervalsQuery = z.infer<
  typeof listWellboreIntervalsQuerySchema
>;
