import { describe, expect, it } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import { SAMPLE_INVENTORY_ROWS } from "../sample-data";
import { InventoryTable } from "./inventory-table";

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
    render(
      <InventoryTable
        rows={SAMPLE_INVENTORY_ROWS}
        emptyMessage="Nothing here."
      />,
    );

    // Two header rows plus one row per product.
    expect(screen.getAllByRole("row")).toHaveLength(
      SAMPLE_INVENTORY_ROWS.length + 2,
    );
    const barite = screen.getByRole("row", { name: /Barite/ });
    expect(within(barite).getAllByRole("cell")[0]?.textContent).toBe("1");
  });

  it("leaves a movement of zero blank but always shows the stock", () => {
    render(
      <InventoryTable
        rows={SAMPLE_INVENTORY_ROWS}
        emptyMessage="Nothing here."
      />,
    );

    // Barite: nothing was used, so the used cells are blank; stock is 164 in every stock cell.
    const cells = within(screen.getByRole("row", { name: /Barite/ }))
      .getAllByRole("cell")
      .map((cell) => cell.textContent);
    expect(cells[6]).toBe(""); // daily used
    expect(cells[7]).toBe(""); // section used
    expect(cells[4]).toBe("164"); // initial stock
    expect(cells[13]).toBe("164"); // final stock
  });

  it("shows a dash for a product without a package", () => {
    render(
      <InventoryTable
        rows={SAMPLE_INVENTORY_ROWS}
        emptyMessage="Nothing here."
      />,
    );

    const skid = within(screen.getByRole("row", { name: /Mud Skid/ }));
    expect(skid.getAllByRole("cell")[2]?.textContent).toBe("—");
  });
});
