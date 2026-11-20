import { beforeEach, describe, expect, it } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import { resetApiClientMock } from "@/test/api-client-mock";
import { makeWell } from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { WellsTable } from "./wells-table";

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
});

const wells = [
  makeWell({ id: "a", name: "A-1", status: "active" }),
  makeWell({ id: "b", name: "B-2", status: "planned" }),
  makeWell({ id: "c", name: "C-3", status: "suspended" }),
];

function renderTable(props: { firstRowNumber?: number } = {}) {
  return render(
    <WellsTable data={wells} emptyMessage="Nothing here." {...props} />,
    {
      wrapper: QueryWrapper,
    },
  );
}

const firstCells = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent);

describe("WellsTable", () => {
  it("has a counter column first, with no visible header text", () => {
    renderTable();

    const header = screen.getAllByRole("columnheader")[0] as HTMLElement;
    expect(header.querySelector(".sr-only")).toBeTruthy();
    expect(header.textContent).toBe("Row");
    expect(screen.getAllByRole("columnheader")[1]?.textContent).toBe("Well");
  });

  it("numbers the rows from 1", () => {
    renderTable();

    expect(firstCells()).toEqual(["1", "2", "3"]);
  });

  it("continues the numbering on the next page", () => {
    renderTable({ firstRowNumber: 11 });

    expect(firstCells()).toEqual(["11", "12", "13"]);
  });

  it("shows the status as a badge, with a colour for each status", () => {
    renderTable();

    const classes = ["active", "planned", "suspended"].map(
      (status) => screen.getByText(status).className,
    );
    expect(new Set(classes).size).toBe(3);
  });

  it("shows the empty message", () => {
    render(<WellsTable data={[]} emptyMessage="No wells yet." />, {
      wrapper: QueryWrapper,
    });

    expect(screen.getByText("No wells yet.")).toBeTruthy();
  });
});
