import { integer, pgEnum, pgTable, unique } from "drizzle-orm/pg-core";
import { MUD_SAMPLE_SOURCES } from "schema";
import { id, timestamps } from "./_shared/columns";
import { measure, sampleColumns, sampleNoRange } from "./_shared/fluid-sample";

// The allowed values live in packages/schema, so the database, the API and the web cannot
// drift apart. Changing the list there needs a new migration here.
export const mudSampleSource = pgEnum("mud_sample_source", MUD_SAMPLE_SOURCES);

// One mud sample of a daily report. Every measurement is optional: a sample may have only some.
export const mudSamples = pgTable(
  "mud_samples",
  {
    ...id,
    ...sampleColumns,
    sample_from: mudSampleSource().notNull().default("Active"),
    flowline_temp_f: measure(5, 1),
    depth_m: measure(8, 2),
    tvd_m: measure(8, 2),
    // Pounds per cubic foot.
    mud_weight_pcf: measure(6, 2),
    mud_temp_f: measure(5, 1),
    // Seconds per quart.
    funnel_viscosity: measure(5, 1),
    api_filtrate_cc: measure(5, 1),
    hthp_filtrate_cc: measure(5, 1),
    // In 1/32 of an inch.
    api_cake: measure(5, 1),
    hthp_cake: measure(5, 1),
    oil_percent: measure(4, 1),
    water_percent: measure(4, 1),
    solids_percent: measure(4, 1),
    sand_percent: measure(5, 2),
    glycol_percent: measure(4, 1),
    // Pounds per barrel.
    mbt_lb_bbl: measure(5, 1),
    ph: measure(4, 2),
    ph_temp_f: measure(5, 1),
    alkalinity_mud_ml: measure(5, 2),
    pf_ml: measure(5, 2),
    mf_ml: measure(5, 2),
    chloride_mg_l: integer(),
    total_hardness_mg_l: integer(),
    ...timestamps,
  },
  (table) => [
    unique("mud_samples_report_id_sample_no_unique").on(
      table.report_id,
      table.sample_no,
    ),
    sampleNoRange("mud_samples_sample_no_range", table.sample_no),
  ],
);
