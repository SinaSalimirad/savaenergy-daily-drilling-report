import { beforeEach, describe, expect, it } from "bun:test";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { PROJECT_FILTER_STORAGE_KEY } from "@/features/projects/project-filter";
import { listWells, resetApiClientMock } from "@/test/api-client-mock";
import { makeReport, makeWell, page } from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { DailyReportsTable } from "./daily-reports-table";

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
  localStorage.clear();
  listWells.mockResolvedValue(
    page([
      makeWell({
        id: "w1",
        name: "SP14",
        project_id: "p1",
        project_name: "South Pars",
      }),
      makeWell({
        id: "w2",
        name: "NS-1",
        project_id: "p2",
        project_name: "North Sea",
      }),
    ]),
  );
});

function renderTable(data = [makeReport()]) {
  return render(
    <DailyReportsTable data={data} emptyMessage="Nothing here." />,
    {
      wrapper: QueryWrapper,
    },
  );
}

describe("DailyReportsTable", () => {
  it("orders the columns: project, well, section and date come first", () => {
    renderTable([]);

    const headers = screen
      .getAllByRole("columnheader")
      .map((header) => header.textContent);
    expect(headers).toEqual([
      "No.",
      "Project",
      "Well",
      "Section",
      "Date",
      "Bit depth (m)",
      "Bit TD (m)",
      "Bit TVD (m)",
      "Inventory",
      "Actions",
    ]);
  });

  it("shows the empty message", () => {
    renderTable([]);

    expect(screen.getByText("Nothing here.")).toBeTruthy();
  });

  it("shows the project of the well of each report", async () => {
    renderTable([
      makeReport({ id: "a", well_id: "w1", well_name: "SP14" }),
      makeReport({ id: "b", well_id: "w2", well_name: "NS-1", report_no: 2 }),
    ]);

    const first = screen.getByRole("row", { name: /SP14/ });
    const second = screen.getByRole("row", { name: /NS-1/ });
    await waitFor(() =>
      expect(within(first).getAllByRole("cell")[1]?.textContent).toBe(
        "South Pars",
      ),
    );
    expect(within(second).getAllByRole("cell")[1]?.textContent).toBe(
      "North Sea",
    );
  });

  it("shows a dash when the project of the well is unknown", async () => {
    renderTable([makeReport({ well_id: "unknown-well" })]);

    await waitFor(() => expect(listWells).toHaveBeenCalled());
    const row = screen.getAllByRole("row")[1] as HTMLElement;
    expect(within(row).getAllByRole("cell")[1]?.textContent).toBe("—");
  });

  it("shows the section without its order number, the date and the depths", () => {
    renderTable([
      makeReport({
        section_hole_size: 14.75,
        report_date: "2026-11-20",
        bit_depth_m: 1250.5,
      }),
    ]);

    const cells = within(screen.getAllByRole("row")[1] as HTMLElement)
      .getAllByRole("cell")
      .map((cell) => cell.textContent);
    expect(cells[3]).toBe('1 · 14 3/4"');
    expect(cells[4]).toBe("2026-11-20");
    expect(cells[5]).toBe("1250.5");
    expect(cells[6]).toBe("—");
  });
});

describe("the Inventory link of a report", () => {
  it("opens the inventory page of that report", () => {
    renderTable([makeReport({ id: "report-42" })]);

    const link = screen.getByRole("link", { name: "Inventory" });

    expect(link.getAttribute("href")).toBe(
      "/dashboard/inventory-and-cost/inventory?report=report-42",
    );
  });

  it("switches the project filter to the project of the report", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p2");
    renderTable([makeReport({ well_id: "w1" })]);
    await waitFor(() => expect(listWells).toHaveBeenCalled());
    // The wells are loaded before the click, so the project of the report is known.
    await waitFor(() => expect(screen.getByText("South Pars")).toBeTruthy());

    fireEvent.click(screen.getByRole("link", { name: "Inventory" }));

    await waitFor(() =>
      expect(localStorage.getItem(PROJECT_FILTER_STORAGE_KEY)).toBe("p1"),
    );
  });

  it("keeps the project filter when it already is the project of the report", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p1");
    renderTable([makeReport({ well_id: "w1" })]);
    await waitFor(() => expect(screen.getByText("South Pars")).toBeTruthy());

    fireEvent.click(screen.getByRole("link", { name: "Inventory" }));

    expect(localStorage.getItem(PROJECT_FILTER_STORAGE_KEY)).toBe("p1");
  });
});
