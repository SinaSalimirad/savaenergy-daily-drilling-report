import { beforeEach, describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { PROJECT_FILTER_STORAGE_KEY } from "@/features/projects/project-filter";
import {
  makeProject,
  makeProjectsPage,
} from "@/features/projects/project-fixtures";
import {
  listDailyReports,
  listInventory,
  listProjects,
  resetApiClientMock,
} from "@/test/api-client-mock";
import {
  makeInventoryRow,
  makeProduct,
  makeReport,
  page,
} from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { WellRecapView } from "./well-recap-view";

// Newest first, as the API lists them: this well's cumulative numbers are read off report #2.
const REPORTS = [
  makeReport({
    id: "r2",
    well_id: "w1",
    well_name: "SP14",
    section_order: 1,
    section_hole_size: 8.5,
    report_no: 2,
    report_date: "2026-11-21",
  }),
  makeReport({
    id: "r1",
    well_id: "w1",
    well_name: "SP14",
    report_no: 1,
    report_date: "2026-11-20",
  }),
];

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
  localStorage.clear();
  listProjects.mockResolvedValue({
    data: makeProjectsPage([makeProject({ id: "p1", name: "North Sea" })]),
    error: null,
  });
  listDailyReports.mockResolvedValue(page(REPORTS));
  listInventory.mockResolvedValue(page([]));
});

function renderView(projectId: string | null = "p1") {
  if (projectId) localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, projectId);
  return render(<WellRecapView />, { wrapper: QueryWrapper });
}

describe("WellRecapView", () => {
  it("asks to select a project when none is chosen", () => {
    renderView(null);

    expect(
      screen.getByText("Select a project to see its well recap."),
    ).toBeTruthy();
    expect(listDailyReports).not.toHaveBeenCalled();
  });

  it("explains that a project without reports has no well recap yet", async () => {
    listDailyReports.mockResolvedValue(page([]));

    renderView();

    expect(await screen.findByText(/no daily reports yet/)).toBeTruthy();
  });

  it("shows only the Well picker, not a Report picker", async () => {
    renderView();

    expect(await screen.findByRole("combobox", { name: "Well" })).toBeTruthy();
    expect(screen.queryByRole("combobox", { name: "Report" })).toBeNull();
  });

  it("reads the well's newest report for the cumulative numbers shown", async () => {
    const { container } = renderView();

    await screen.findByRole("combobox", { name: "Well" });
    const header = container.querySelector("header") as HTMLElement;
    expect(header.textContent).toContain("#2");
    expect(header.textContent).toContain("2026-11-21");
  });

  it("shows every product of the well, not only the ones used that day", async () => {
    listInventory.mockResolvedValue(
      page([
        makeInventoryRow({
          id: "used",
          product: makeProduct({ id: "barite", name: "Barite" }),
          daily_used: 0,
          cumulative_used: 12,
        }),
      ]),
    );

    renderView();

    expect(await screen.findByRole("row", { name: /Barite/ })).toBeTruthy();
  });
});
