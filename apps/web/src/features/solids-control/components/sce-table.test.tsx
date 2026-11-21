import { beforeEach, describe, expect, it } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import { resetApiClientMock } from "@/test/api-client-mock";
import { makeSce } from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { SceTable } from "./sce-table";

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
});

// The rows of the rig's sheet.
const units = [
  makeSce({
    id: "a",
    sort_order: 1,
    unit_no: 1,
    screen_size: "140/140/140/140",
  }),
  makeSce({
    id: "b",
    sort_order: 2,
    unit_no: 2,
    screen_size: "170/170/170/170",
  }),
  makeSce({
    id: "c",
    sort_order: 3,
    unit_no: 3,
    screen_size: "200/200/200/200",
  }),
];

const rowCells = (index: number) =>
  within(screen.getAllByRole("row")[index + 1] as HTMLElement)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

describe("SceTable", () => {
  it("shows the columns of the sheet", () => {
    render(<SceTable data={units} emptyMessage="Nothing." />, {
      wrapper: QueryWrapper,
    });

    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toEqual([
      "Row",
      "Type",
      "No.",
      "Manufactured by",
      "Screen size",
      "Model",
      "Project",
      "Actions",
    ]);
  });

  it("shows a row of the sheet, with a dash for what is empty", () => {
    render(<SceTable data={units} emptyMessage="Nothing." />, {
      wrapper: QueryWrapper,
    });

    expect(rowCells(1).slice(0, 7)).toEqual([
      "2",
      "Shale shaker",
      "2",
      "Swaco",
      "170/170/170/170",
      "—",
      "North Sea",
    ]);
  });

  it("shows the empty message", () => {
    render(<SceTable data={[]} emptyMessage="No units yet." />, {
      wrapper: QueryWrapper,
    });

    expect(screen.getByText("No units yet.")).toBeTruthy();
  });
});
