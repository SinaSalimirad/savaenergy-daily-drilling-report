import { integer, pgTable, unique } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared/columns";
import { measure, sampleColumns, sampleNoRange } from "./_shared/fluid-sample";

// What the retort and the titrations measured for one sample of a daily report. Salt,
// bentonite, low and high gravity solids are computed by the API, so they are not stored.
export const solidsAnalyses = pgTable(
  "solids_analyses",
  {
    ...id,
    ...sampleColumns,
    // Pounds per cubic foot.
    mud_weight_pcf: measure(6, 2),
    // Pounds per barrel.
    mbt_lb_bbl: measure(5, 1),
    chloride_mg_l: integer(),
    oil_percent: measure(4, 1),
    water_percent: measure(4, 1),
    solids_percent: measure(4, 1),
    glycol_percent: measure(4, 1),
    ...timestamps,
  },
  (table) => [
    unique("solids_analyses_report_id_sample_no_unique").on(
      table.report_id,
      table.sample_no,
    ),
    sampleNoRange("solids_analyses_sample_no_range", table.sample_no),
  ],
);
