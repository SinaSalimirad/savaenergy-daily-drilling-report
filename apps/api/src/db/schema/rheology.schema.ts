import { pgTable, unique } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared/columns";
import { measure, sampleColumns, sampleNoRange } from "./_shared/fluid-sample";

// The viscometer readings of one sample of a daily report. PV, YP, n and K are computed by
// the API from these readings, so they are not stored.
export const rheologyReadings = pgTable(
  "rheology_readings",
  {
    ...id,
    ...sampleColumns,
    temperature_f: measure(5, 1),
    r600: measure(5, 1),
    r300: measure(5, 1),
    r200: measure(5, 1),
    r100: measure(5, 1),
    r6: measure(5, 1),
    r3: measure(5, 1),
    // lb/100 ft².
    gel_10s: measure(5, 1),
    gel_10m: measure(5, 1),
    gel_30m: measure(5, 1),
    ...timestamps,
  },
  (table) => [
    unique("rheology_readings_report_id_sample_no_unique").on(
      table.report_id,
      table.sample_no,
    ),
    sampleNoRange("rheology_readings_sample_no_range", table.sample_no),
  ],
);
