import { beforeEach, describe, expect, it } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import { resetApiClientMock } from "@/test/api-client-mock";
import { makePump } from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { PumpsTable } from "./pumps-table";

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
});

// The rows of the rig's sheet.
const pumps = [
  makePump({ id: "a", order: 1, liner_diameter: 6, gal_per_stroke: 4.1861 }),
  makePump({ id: "b", order: 2, liner_diameter: 6, gal_per_stroke: 4.1861 }),
  makePump({ id: "c", order: 3, liner_diameter: 6.5, gal_per_stroke: 4.9129 }),
];

const rowCells = (index: number) =>
  within(screen.getAllByRole("row")[index + 1] as HTMLElement)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

describe("PumpsTable", () => {
  it("shows the columns of the sheet", () => {
    render(<PumpsTable data={pumps} emptyMessage="Nothing." />, {
      wrapper: QueryWrapper,
    });

    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toEqual([
      "Row",
      "Model",
      "Project",
      "Stroke length (in)",
      "Eff. %",
      "Liner dia (in)",
      "Type",
      "Gal/Stroke",
      "Actions",
    ]);
  });

  it("shows a row with two decimals for the liner and the output", () => {
    render(<PumpsTable data={pumps} emptyMessage="Nothing." />, {
      wrapper: QueryWrapper,
    });

    expect(rowCells(0).slice(0, 8)).toEqual([
      "1",
      "FH 1500",
      "North Sea",
      "12",
      "95",
      "6.00",
      "Triplex",
      "4.19",
    ]);
    expect(rowCells(2)[5]).toBe("6.50");
    expect(rowCells(2)[7]).toBe("4.91");
  });

  it("shows a dash when a pump has no output per stroke", () => {
    render(
      <PumpsTable
        data={[makePump({ type: "duplex", gal_per_stroke: null })]}
        emptyMessage="Nothing."
      />,
      { wrapper: QueryWrapper },
    );

    expect(rowCells(0)[6]).toBe("Duplex");
    expect(rowCells(0)[7]).toBe("—");
  });

  it("shows the empty message", () => {
    render(<PumpsTable data={[]} emptyMessage="No pumps yet." />, {
      wrapper: QueryWrapper,
    });

    expect(screen.getByText("No pumps yet.")).toBeTruthy();
  });
});
