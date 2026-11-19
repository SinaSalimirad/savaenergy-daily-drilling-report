import * as z from "zod";

// Single source of truth for well values, shared by the API (Postgres enum) and the web.
export const WELL_STATUSES = [
  "planned",
  "active",
  "completed",
  "archived",
  "suspended",
] as const;
export const wellStatusSchema = z.enum(WELL_STATUSES);
export type WellStatus = z.infer<typeof wellStatusSchema>;
