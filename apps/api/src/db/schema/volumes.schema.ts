import { numeric, pgTable, unique, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared/columns";
import { dailyReports } from "./daily_report.schema";

// Barrels. `null` means "not entered": the API reads it as 0 (or, for the start volume, as the
// end volume of the previous report).
const barrels = () => numeric({ precision: 10, scale: 2, mode: "number" });

const reportId = () =>
  uuid()
    .notNull()
    .references(() => dailyReports.id);

// What was added to the mud, and what came in or went out of the system, on one daily report.
export const volumeAccountings = pgTable(
  "volume_accountings",
  {
    ...id,
    report_id: reportId(),
    start_volume_bbl: barrels(),
    water_added_bbl: barrels(),
    chemical_volume_bbl: barrels(),
    diesel_added_bbl: barrels(),
    received_bbl: barrels(),
    returned_bbl: barrels(),
    ...timestamps,
  },
  (table) => [
    unique("volume_accountings_report_id_unique").on(table.report_id),
  ],
);

// Where mud was lost on one daily report.
export const mudLosses = pgTable(
  "mud_losses",
  {
    ...id,
    report_id: reportId(),
    dumped_bbl: barrels(),
    shakers_bbl: barrels(),
    evaporation_bbl: barrels(),
    super_clone_bbl: barrels(),
    trip_loss_bbl: barrels(),
    desander_desilter_bbl: barrels(),
    pit_cleaning_bbl: barrels(),
    other_bbl: barrels(),
    formation_bbl: barrels(),
    left_in_hole_bbl: barrels(),
    ...timestamps,
  },
  (table) => [unique("mud_losses_report_id_unique").on(table.report_id)],
);
