import { describe, expect, it } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import type { InventoryRow } from "../api";
import { InventoryTable } from "./inventory-table";

const BULK = {
  kind: "bulk",
  package_size: 25,
  package_unit: "kg",
  specific_gravity: 4.2,
  length_m: null,
  width_m: null,
} as const;

// Only the fields the table shows matter; the numbers come from the server in real life.
function row(
  name: string,
  overrides: Partial<InventoryRow> = {},
): InventoryRow {
  return {
    id: name,
    report_id: "report",
    project_product_id: name,
    product: {
      id: name,
      name,
      ...BULK,
      created_at: "2026-03-01T00:00:00.000Z",
      updated_at: "2026-03-01T00:00:00.000Z",
    },
    origin: "local",
    unit_price: 12.5,
    initial_stock: 164,
    daily_received: 0,
    daily_used: 0,
    daily_returned: 0,
    section_used: 0,
    monthly_received: 0,
    monthly_used: 0,
    cumulative_received: 0,
    cumulative_used: 0,
    cumulative_returned: 0,
    final_stock: 164,
    daily_cost: 0,
    ...overrides,
  };
}

const SKID = row("Mud Skid", {
  product: {
    id: "skid",
    name: "Mud Skid",
    kind: "equipment",
    package_size: null,
    package_unit: null,
    specific_gravity: null,
    length_m: null,
    width_m: null,
    created_at: "2026-03-01T00:00:00.000Z",
    updated_at: "2026-03-01T00:00:00.000Z",
  },
  unit_price: null,
  daily_cost: null,
});
const ROWS = [
  row("Barite"),
  row("Lime", { daily_used: 3, section_used: 3 }),
  SKID,
];

describe("InventoryTable", () => {
  it("shows the group headers", () => {
    render(<InventoryTable rows={[]} emptyMessage="Nothing here." />);

    for (const name of [
      "Daily",
      "Monthly",
      "Cumulative",
      "Section used",
      "Initial stock",
      "Final stock",
      "Return",
      "Unit price",
      "Daily cost",
    ]) {
      expect(screen.getByRole("columnheader", { name })).toBeTruthy();
    }
  });

  it("shows the empty message instead of rows", () => {
    render(<InventoryTable rows={[]} emptyMessage="Nothing here." />);

    expect(screen.getByText("Nothing here.")).toBeTruthy();
  });

  it("shows one numbered row per product", () => {
    render(<InventoryTable rows={ROWS} emptyMessage="Nothing here." />);

    // Two header rows plus one row per product.
    expect(screen.getAllByRole("row")).toHaveLength(ROWS.length + 2);
    const barite = screen.getByRole("row", { name: /Barite/ });
    expect(within(barite).getAllByRole("cell")[0]?.textContent).toBe("1");
  });

  it("shows a zero instead of leaving a number blank", () => {
    render(<InventoryTable rows={ROWS} emptyMessage="Nothing here." />);

    // Barite: nothing was used, so the used cells show 0; stock is 164 in every stock cell.
    const cells = within(screen.getByRole("row", { name: /Barite/ }))
      .getAllByRole("cell")
      .map((cell) => cell.textContent);
    expect(cells[6]).toBe("0"); // daily used
    expect(cells[7]).toBe("0"); // section used
    expect(cells[4]).toBe("164"); // initial stock
    expect(cells[13]).toBe("164"); // final stock
  });

  it("writes the package of a product, and a dash when it has none", () => {
    render(<InventoryTable rows={ROWS} emptyMessage="Nothing here." />);

    const barite = within(screen.getByRole("row", { name: /Barite/ }));
    const skid = within(screen.getByRole("row", { name: /Mud Skid/ }));
    expect(barite.getAllByRole("cell")[2]?.textContent).toBe("25 kg");
    expect(skid.getAllByRole("cell")[2]?.textContent).toBe("—");
  });

  it("adds an actions column only when asked", () => {
    render(
      <InventoryTable
        rows={ROWS}
        emptyMessage="Nothing here."
        renderActions={(item) => <button type="button">act {item.id}</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "act Barite" })).toBeTruthy();
  });
});
