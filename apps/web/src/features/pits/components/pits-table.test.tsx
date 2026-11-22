import { beforeEach, describe, expect, it } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import { resetApiClientMock } from "@/test/api-client-mock";
import { makePit } from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { PitsTable } from "./pits-table";

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
});

const rowCells = (index: number) =>
  within(screen.getAllByRole("row")[index + 1] as HTMLElement)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

describe("PitsTable", () => {
  it("shows the columns of the sheet", () => {
    render(<PitsTable data={[makePit()]} emptyMessage="Nothing." />, {
      wrapper: QueryWrapper,
    });

    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toEqual(["Row", "Pit", "Project", "Type", "Capacity (bbl)", "Actions"]);
  });

  it("shows a row with its type label and a formatted capacity", () => {
    render(
      <PitsTable
        data={[makePit({ type: "not mud", capacity: 1250.5 })]}
        emptyMessage="Nothing."
      />,
      { wrapper: QueryWrapper },
    );

    expect(rowCells(0).slice(0, 5)).toEqual([
      "1",
      "Active 1",
      "North Sea",
      "Not mud",
      "1,250.50",
    ]);
  });

  it("shows a dash when the capacity is not known", () => {
    render(
      <PitsTable
        data={[makePit({ capacity: null })]}
        emptyMessage="Nothing."
      />,
      { wrapper: QueryWrapper },
    );

    expect(rowCells(0)[4]).toBe("—");
  });

  it("shows the empty message", () => {
    render(<PitsTable data={[]} emptyMessage="No pits yet." />, {
      wrapper: QueryWrapper,
    });

    expect(screen.getByText("No pits yet.")).toBeTruthy();
  });
});
