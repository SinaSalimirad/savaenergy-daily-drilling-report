import { sql } from "drizzle-orm";
import {
  check,
  date,
  foreignKey,
  integer,
  numeric,
  pgTable,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { authorship } from "./_shared/authorship";
import { id, timestamps } from "./_shared/columns";
import { sections } from "./section.schema";
import { wells } from "./well.schema";

// Constraint names in one place: the table below creates them, the service reads them to tell
// which rule a write broke.
export const DAILY_REPORT_CONSTRAINTS = {
  uniqueDate: "daily_reports_well_id_report_date_unique",
  uniqueNumber: "daily_reports_well_id_report_no_unique",
  sectionBelongsToWell: "daily_reports_section_belongs_to_well_fk",
} as const;

// One report per well per day.
export const dailyReports = pgTable(
  "daily_reports",
  {
    ...id,
    well_id: uuid()
      .notNull()
      .references(() => wells.id),
    // A well has many sections, so the well alone can't tell which section
    // was being drilled that day. The report stores it. The composite FK below
    // guarantees the section belongs to this report's well.
    section_id: uuid().notNull(),

    report_no: integer().notNull(),
    report_date: date().notNull(),

    bit_depth_m: numeric({ precision: 12, scale: 5, mode: "number" }),
    bit_td_m: numeric({ precision: 12, scale: 5, mode: "number" }),
    bit_tvd_m: numeric({ precision: 12, scale: 5, mode: "number" }),

    ...timestamps,
    ...authorship,
  },
  (table) => [
    // (well_id, section_id) must match an existing (well_id, id) pair in sections,
    // so a report of well A can never point to a section of well B.
    foreignKey({
      name: DAILY_REPORT_CONSTRAINTS.sectionBelongsToWell,
      columns: [table.section_id, table.well_id],
      foreignColumns: [sections.id, sections.well_id],
    }),
    unique(DAILY_REPORT_CONSTRAINTS.uniqueDate).on(
      table.well_id,
      table.report_date,
    ),
    unique(DAILY_REPORT_CONSTRAINTS.uniqueNumber).on(
      table.well_id,
      table.report_no,
    ),
    check("daily_reports_report_no_positive", sql`${table.report_no} > 0`),
    check(
      "daily_reports_depths_non_negative",
      sql`${table.bit_depth_m} >= 0 AND ${table.bit_td_m} >= 0 AND ${table.bit_tvd_m} >= 0`,
    ),
  ],
);
