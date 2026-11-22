import { sql } from "drizzle-orm";
import {
  check,
  numeric,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared/columns";
import { dailyReports } from "./daily_report.schema";
import { pits } from "./pit.schema";

// What one pit held on one daily report. The pit's name, type and capacity stay in `pits`.
export const pitReadings = pgTable(
  "pit_readings",
  {
    ...id,
    report_id: uuid()
      .notNull()
      .references(() => dailyReports.id),
    pit_id: uuid()
      .notNull()
      .references(() => pits.id),
    // Barrels.
    volume: numeric({ precision: 8, scale: 2, mode: "number" }).notNull(),
    // Pounds per cubic foot (pcf).
    mud_weight: numeric({ precision: 6, scale: 2, mode: "number" }),
    mud_type: text(),
    ...timestamps,
  },
  (table) => [
    unique("pit_readings_report_id_pit_id_unique").on(
      table.report_id,
      table.pit_id,
    ),
    check("pit_readings_volume_nonnegative", sql`${table.volume} >= 0`),
    check("pit_readings_mud_weight_positive", sql`${table.mud_weight} > 0`),
  ],
);
