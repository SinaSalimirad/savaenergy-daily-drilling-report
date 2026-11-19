// TEMPORARY: hand-written because the API has no inventory endpoint yet. When it exists, replace
// these with types inferred through Eden (as features/reports/api.ts does), so API changes
// break the web typecheck.
//
// Every number is computed by the backend. The web only displays them.
export type InventoryRow = {
  product_id: string;
  name: string;
  package: string | null; // equipment such as a mud skid has no package
  unit_price: number | null; // in the project's currency
  initial_stock: number;
  daily_received: number;
  daily_used: number;
  section_used: number;
  monthly_received: number;
  monthly_used: number;
  cumulative_received: number;
  cumulative_used: number;
  cumulative_returned: number;
  final_stock: number;
  daily_cost: number | null;
};
