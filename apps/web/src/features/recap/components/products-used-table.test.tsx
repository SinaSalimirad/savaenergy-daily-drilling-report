import { describe, expect, it } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import { makeInventoryRow, makeProduct } from "@/test/fixtures";
import { ProductsUsedTable } from "./products-used-table";

const BARITE = makeInventoryRow({
  id: "row-barite",
  product: makeProduct({ id: "barite", name: "Barite" }),
  daily_used: 3,
  final_stock: 161,
  daily_cost: 37.5,
});

describe("ProductsUsedTable", () => {
  it("shows the column headers", () => {
    render(<ProductsUsedTable rows={[]} emptyMessage="Nothing here." />);

    for (const name of ["Product name", "Package", "Used", "Final", "Cost"]) {
      expect(screen.getByRole("columnheader", { name })).toBeTruthy();
    }
  });

  it("shows the empty message instead of rows", () => {
    render(<ProductsUsedTable rows={[]} emptyMessage="Nothing here." />);

    expect(screen.getByText("Nothing here.")).toBeTruthy();
  });

  it("shows one numbered row per product with its used amount, final stock and cost", () => {
    render(<ProductsUsedTable rows={[BARITE]} emptyMessage="Nothing here." />);

    const cells = within(screen.getByRole("row", { name: /Barite/ }))
      .getAllByRole("cell")
      .map((cell) => cell.textContent);
    expect(cells).toEqual(["1", "Barite", "25 kg", "3", "161", "37.5"]);
  });

  it("writes a dash where a product has no package or cost", () => {
    const skid = makeInventoryRow({
      id: "row-skid",
      product: makeProduct({
        id: "skid",
        name: "Mud Skid",
        kind: "equipment",
        package_size: null,
        package_unit: null,
        specific_gravity: null,
      }),
      daily_used: 1,
      final_stock: 4,
      daily_cost: null,
    });

    render(<ProductsUsedTable rows={[skid]} emptyMessage="Nothing here." />);

    const cells = within(screen.getByRole("row", { name: /Mud Skid/ }))
      .getAllByRole("cell")
      .map((cell) => cell.textContent);
    expect(cells).toEqual(["1", "Mud Skid", "—", "1", "4", "—"]);
  });
});
