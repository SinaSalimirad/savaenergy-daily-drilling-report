import type { InventoryRow } from "./types";

// TEMPORARY sample data copied from the Excel inventory sheet, until the API exists.

// A product that was only received at the start of the month and not used yet.
function untouched(
  name: string,
  pack: string | null,
  stock: number,
): InventoryRow {
  return {
    product_id: name,
    name,
    package: pack,
    unit_price: null,
    initial_stock: stock,
    daily_received: 0,
    daily_used: 0,
    section_used: 0,
    monthly_received: stock,
    monthly_used: 0,
    cumulative_received: stock,
    cumulative_used: 0,
    cumulative_returned: 0,
    final_stock: stock,
    daily_cost: null,
  };
}

// Used in an earlier report of the section: `used` leaves the stock, `received` adds to it.
function withUsage(
  base: InventoryRow,
  received: number,
  used: number,
): InventoryRow {
  return {
    ...base,
    section_used: used,
    monthly_received: base.monthly_received + received,
    monthly_used: used,
    cumulative_received: base.cumulative_received + received,
    cumulative_used: used,
    final_stock: base.final_stock + received - used,
  };
}

export const SAMPLE_INVENTORY_ROWS: InventoryRow[] = [
  untouched("Barite", "1.5 MT", 164),
  untouched("Bio Cide", "55 Gal", 4),
  untouched("Caustic Soda", "25 kg", 80),
  untouched("Citric Acid", "25 kg", 13),
  untouched("Defomer", "55 Gal", 1),
  untouched("Drilling Detergent", "55 Gal", 4),
  untouched("Hematite", "1.5 MT", 18),
  untouched("H2S Scav (Zinc Carbonate)", "25 kg", 40),
  untouched("Kwick seal F", "25 kg", 40),
  untouched("Kwick seal M", "25 kg", 40),
  untouched("Kwick seal C", "25 kg", 40),
  withUsage(untouched("Lime", "25 kg", 98), 1, 1),
  untouched("Lignosulfonate", "25 kg", 40),
  untouched("Mica F", "25 kg", 40),
  untouched("Mica M", "25 kg", 40),
  untouched("Mica C", "25 kg", 40),
  untouched("Nut Plug F", "25 kg", 40),
  untouched("Nut Plug M", "25 kg", 40),
  untouched("Nut Plug C", "25 kg", 40),
  untouched("Pipe LAX NW", "55 Gal", 4),
  untouched("Soda Ash", "50 kg", 40),
  untouched("Sodium Bicarbonate", "25 kg", 52),
  untouched("Starch HT", "25 kg", 200),
  withUsage(untouched("Sodium Chloride (Salt)", "1 MT", 56), 10, 10),
  untouched("Xanthan Gum", "25 kg", 40),
  untouched("Mud Skid", null, 4),
  untouched("Tarpaulin 10*10", "10*10 m", 5),
  untouched("Tarpaulin 10*15", "10*15 m", 7),
];
