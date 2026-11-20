import type { InventoryRow } from "@/features/inventory/api";
import type { Product } from "@/features/products/api";
import type { ProjectProduct } from "@/features/project-products/api";
import type { DailyReport } from "@/features/reports/api";
import type { Well } from "@/features/wells/api";

// Valid objects with every field. Tests override only what they care about. The shapes come from
// the API types (Eden), so a change in the API breaks these builders at typecheck time.
const DATE = "2026-01-01T00:00:00.000Z";

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "product-1",
    name: "Barite",
    kind: "bulk",
    package_size: 25,
    package_unit: "kg",
    specific_gravity: 4.2,
    length_m: null,
    width_m: null,
    created_at: DATE,
    updated_at: DATE,
    ...overrides,
  };
}

export function makeProjectProduct(
  overrides: Partial<ProjectProduct> = {},
): ProjectProduct {
  const product = overrides.product ?? makeProduct();
  return {
    id: "pp-1",
    project_id: "p1",
    product_id: product.id,
    origin: "local",
    price: 60,
    product,
    created_at: DATE,
    updated_at: DATE,
    ...overrides,
  };
}

export function makeInventoryRow(
  overrides: Partial<InventoryRow> = {},
): InventoryRow {
  const product = overrides.product ?? makeProduct();
  return {
    id: "row-1",
    report_id: "report-1",
    project_product_id: "pp-1",
    product,
    origin: "local",
    unit_price: 60,
    initial_stock: 10,
    daily_received: 0,
    daily_used: 0,
    daily_returned: 0,
    section_used: 0,
    monthly_received: 0,
    monthly_used: 0,
    cumulative_received: 0,
    cumulative_used: 0,
    cumulative_returned: 0,
    final_stock: 10,
    daily_cost: 0,
    ...overrides,
  };
}

export function makeWell(overrides: Partial<Well> = {}): Well {
  return {
    id: "w1",
    project_id: "p1",
    project_name: "North Sea",
    name: "SP14",
    designation: null,
    well_type: null,
    status: "active",
    rig_name: "Rig 1",
    rig_type: "onshore",
    spud_date: null,
    water_depth: null,
    created_at: DATE,
    updated_at: DATE,
    ...overrides,
  };
}

export function makeReport(overrides: Partial<DailyReport> = {}): DailyReport {
  return {
    id: "report-1",
    well_id: "w1",
    well_name: "SP14",
    section_id: "s1",
    section_order: 1,
    section_hole_size: 14.75,
    report_no: 1,
    report_date: "2026-11-20",
    bit_depth_m: null,
    bit_td_m: null,
    bit_tvd_m: null,
    created_at: DATE,
    updated_at: DATE,
    ...overrides,
  };
}

/** The envelope the list endpoints answer with. */
export const page = <T>(data: T[]) => ({
  data: { data, meta: { page: 1, pageSize: 100, total: data.length } },
  error: null,
});

export const failure = (message = "boom", status = 500) => ({
  data: null,
  error: { status, value: { code: "ERROR", message } },
});
