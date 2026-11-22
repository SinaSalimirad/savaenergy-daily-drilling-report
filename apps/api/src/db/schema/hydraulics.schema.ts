import { sql } from "drizzle-orm";
import {
  check,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { type BitNozzle, WELLBORE_INTERVAL_TYPES } from "schema";
import { id, timestamps } from "./_shared/columns";
import { dailyReports } from "./daily_report.schema";
import { wells } from "./well.schema";

const reportId = () =>
  uuid()
    .notNull()
    .references(() => dailyReports.id);

const measure = (precision: number, scale: number) =>
  numeric({ precision, scale, mode: "number" });

// The allowed values live in packages/schema, so the database, the API and the web cannot
// drift apart. Changing the list there needs a new migration here.
export const wellboreIntervalType = pgEnum(
  "wellbore_interval_type",
  WELLBORE_INTERVAL_TYPES,
);

// The geometry of the well on one daily report: the casings and liners, then the open hole.
export const wellboreIntervals = pgTable(
  "wellbore_intervals",
  {
    ...id,
    report_id: reportId(),
    order: integer().notNull(),
    interval_type: wellboreIntervalType().notNull(),
    top_md_m: measure(8, 2).notNull(),
    bottom_md_m: measure(8, 2).notNull(),
    // Inches. Casing and liner: the outside diameter. An open hole has none.
    od_in: measure(6, 3),
    // Inches. Casing and liner: the inside diameter. Open hole: the diameter of the hole.
    id_in: measure(6, 3).notNull(),
    linear_weight_lb_ft: measure(6, 2),
    ...timestamps,
  },
  (table) => [
    unique("wellbore_intervals_report_id_order_unique").on(
      table.report_id,
      table.order,
    ),
    check(
      "wellbore_intervals_bottom_below_top",
      sql`${table.bottom_md_m} > ${table.top_md_m}`,
    ),
    check("wellbore_intervals_id_positive", sql`${table.id_in} > 0`),
  ],
);

// The drill string of one daily report, from the surface down to the bit.
export const drillStringTools = pgTable(
  "drill_string_tools",
  {
    ...id,
    report_id: reportId(),
    order: integer().notNull(),
    tool_type: text().notNull(),
    length_m: measure(8, 2).notNull(),
    od_in: measure(6, 3).notNull(),
    id_in: measure(6, 3).notNull(),
    ...timestamps,
  },
  (table) => [
    unique("drill_string_tools_report_id_order_unique").on(
      table.report_id,
      table.order,
    ),
    check("drill_string_tools_length_positive", sql`${table.length_m} > 0`),
    check(
      "drill_string_tools_id_below_od",
      sql`${table.id_in} > 0 and ${table.id_in} < ${table.od_in}`,
    ),
  ],
);

// The bit of one daily report. A report has one.
export const bits = pgTable(
  "bits",
  {
    ...id,
    report_id: reportId(),
    bit_type: text().notNull(),
    size_in: measure(6, 3).notNull(),
    manufacturer: text(),
    // [{ size_32nds: 12, qty: 3 }]: three 12/32" nozzles.
    nozzles: jsonb().$type<BitNozzle[]>().notNull().default([]),
    ...timestamps,
  },
  (table) => [
    unique("bits_report_id_unique").on(table.report_id),
    check("bits_size_positive", sql`${table.size_in} > 0`),
  ],
);

// The survey of a well: one row per station. The vertical depth and the rest are computed.
export const surveyStations = pgTable(
  "survey_stations",
  {
    ...id,
    well_id: uuid()
      .notNull()
      .references(() => wells.id),
    md_m: measure(8, 2).notNull(),
    inclination_deg: measure(5, 2).notNull(),
    azimuth_deg: measure(5, 2).notNull(),
    ...timestamps,
  },
  (table) => [
    unique("survey_stations_well_id_md_unique").on(table.well_id, table.md_m),
    check(
      "survey_stations_inclination_range",
      sql`${table.inclination_deg} between 0 and 180`,
    ),
    check(
      "survey_stations_azimuth_range",
      sql`${table.azimuth_deg} >= 0 and ${table.azimuth_deg} < 360`,
    ),
  ],
);

// What the hydraulics of one daily report needs besides the other pages: the flowrate, the ROP
// and the cuttings. A report has one set. Empty values stay empty: the API says what is missing.
export const hydraulicInputs = pgTable(
  "hydraulic_inputs",
  {
    ...id,
    report_id: reportId(),
    flowrate_gpm: measure(7, 1),
    rop_m_hr: measure(6, 2),
    cuttings_diameter_in: measure(4, 3),
    cuttings_density_sg: measure(4, 2),
    ...timestamps,
  },
  (table) => [unique("hydraulic_inputs_report_id_unique").on(table.report_id)],
);
