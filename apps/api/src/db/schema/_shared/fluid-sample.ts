import { sql } from "drizzle-orm";
import { check, integer, numeric, time, uuid } from "drizzle-orm/pg-core";
import { MAX_SAMPLES_PER_REPORT } from "schema";
import { dailyReports } from "../daily_report.schema";

/** A measured value: `null` means "not measured". */
export const measure = (precision: number, scale: number) =>
  numeric({ precision, scale, mode: "number" });

/** The columns every fluid sample of a daily report starts with. */
export const sampleColumns = {
  report_id: uuid()
    .notNull()
    .references(() => dailyReports.id),
  // 1 to 3, like the 3 columns of the rig's sheet.
  sample_no: integer().notNull(),
  sample_time: time({ precision: 0 }),
};

/** The rule that keeps `sample_no` inside the 3 columns of the sheet. */
export const sampleNoRange = (name: string, sampleNo: unknown) =>
  check(
    name,
    sql`${sampleNo} between 1 and ${sql.raw(String(MAX_SAMPLES_PER_REPORT))}`,
  );
