import { hydraulicInputSetSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const setHydraulicInputSchema = hydraulicInputSetSchema;
export type SetHydraulicInputBody = z.infer<typeof setHydraulicInputSchema>;

// Everything here is the sheet of one daily report, so the report is required.
export const hydraulicsQuerySchema = z.object({ report_id: z.uuid() });
export type HydraulicsQuery = z.infer<typeof hydraulicsQuerySchema>;
