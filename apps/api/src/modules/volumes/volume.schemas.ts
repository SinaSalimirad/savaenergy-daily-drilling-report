import { mudLossSetSchema, volumeAccountingSetSchema } from "schema";
import * as z from "zod";

// What a client may send comes from packages/schema, shared with the web.
export const setVolumeAccountingSchema = volumeAccountingSetSchema;
export type SetVolumeAccountingBody = z.infer<typeof setVolumeAccountingSchema>;

export const setMudLossSchema = mudLossSetSchema;
export type SetMudLossBody = z.infer<typeof setMudLossSchema>;

// The sheet is the sheet of one daily report, so the report is required.
export const volumeSheetQuerySchema = z.object({ report_id: z.uuid() });
export type VolumeSheetQuery = z.infer<typeof volumeSheetQuerySchema>;
