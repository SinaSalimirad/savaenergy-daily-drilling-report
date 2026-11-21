import { beforeEach, describe, expect, it } from "bun:test";
import { fireEvent, render, screen, within } from "@testing-library/react";
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
import { SectionRecapView } from "./section-recap-view";

const REPORT = makeReport({
  id: "r1",
  well_id: "w1",
  well_name: "SP14",
  section_order: 2,
  section_hole_size: 8.5,
  report_no: 3,
  report_date: "2026-11-22",
});

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
  localStorage.clear();
  listProjects.mockResolvedValue({
    data: makeProjectsPage([makeProject({ id: "p1", name: "North Sea" })]),
    error: null,
  });
  listDailyReports.mockResolvedValue(page([REPORT]));
  listInventory.mockResolvedValue(page([]));
});

function renderView(projectId: string | null = "p1") {
  if (projectId) localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, projectId);
  return render(<SectionRecapView />, { wrapper: QueryWrapper });
}

const picker = (name: string) => screen.findByRole("combobox", { name });

// A Select option reacts to a full press (down, up, click), not only to the click.
function choose(option: HTMLElement) {
  fireEvent.pointerDown(option);
  fireEvent.mouseDown(option);
  fireEvent.pointerUp(option);
  fireEvent.mouseUp(option);
  fireEvent.click(option);
}

describe("SectionRecapView", () => {
  it("asks to select a project when none is chosen", () => {
    renderView(null);

    expect(screen.getByText("Select a project to see its recap.")).toBeTruthy();
    expect(listDailyReports).not.toHaveBeenCalled();
  });

  it("explains that a project without reports has no recap yet", async () => {
    listDailyReports.mockResolvedValue(page([]));

    renderView();

    expect(await screen.findByText(/no daily reports yet/)).toBeTruthy();
  });

  it("shows the well, section, report number and date of the chosen report", async () => {
    const { container } = renderView();

    await screen.findByText("Products used — last 24 hrs");
    const header = container.querySelector("header") as HTMLElement;
    expect(within(header).getByText("SP14")).toBeTruthy();
    expect(within(header).getByText(/2 · 8 1\/2"/)).toBeTruthy();
    expect(within(header).getByText("#3")).toBeTruthy();
    expect(within(header).getByText("2026-11-22")).toBeTruthy();
  });

  it("shows only the products used that day in the compact table, and every product in the full inventory table", async () => {
    listInventory.mockResolvedValue(
      page([
        makeInventoryRow({
          id: "used",
          product: makeProduct({ id: "barite", name: "Barite" }),
          daily_used: 3,
        }),
        makeInventoryRow({
          id: "unused",
          product: makeProduct({ id: "lime", name: "Lime" }),
          daily_used: 0,
        }),
      ]),
    );

    renderView();

    const usedSection = (
      await screen.findByText("Products used — last 24 hrs")
    ).closest("section") as HTMLElement;
    expect(
      within(usedSection).getByRole("row", { name: /Barite/ }),
    ).toBeTruthy();
    expect(within(usedSection).queryByRole("row", { name: /Lime/ })).toBeNull();

    const inventorySection = screen
      .getByText("Wellsite chemical inventory")
      .closest("section") as HTMLElement;
    expect(
      within(inventorySection).getByRole("row", { name: /Barite/ }),
    ).toBeTruthy();
    expect(
      within(inventorySection).getByRole("row", { name: /Lime/ }),
    ).toBeTruthy();
  });

  it("hides the Section picker when the well was drilled in only one section", async () => {
    renderView();

    await picker("Well");
    expect(screen.queryByRole("combobox", { name: "Section" })).toBeNull();
  });

  it("filters the reports by section once the well has more than one", async () => {
    const section1Report = makeReport({
      id: "r-sec1",
      well_id: "w1",
      well_name: "SP14",
      section_id: "sec-1",
      section_order: 1,
      section_hole_size: 12.25,
      report_no: 1,
      report_date: "2026-08-02",
    });
    const section2Report = makeReport({
      id: "r-sec2",
      well_id: "w1",
      well_name: "SP14",
      section_id: "sec-2",
      section_order: 2,
      section_hole_size: 8.5,
      report_no: 2,
      report_date: "2026-08-09",
    });
    listDailyReports.mockResolvedValue(page([section2Report, section1Report]));

    renderView();

    expect((await picker("Report")).textContent).toContain("#2");
    expect((await picker("Section")).textContent).toContain("All");

    fireEvent.click(await picker("Section"));
    choose(await screen.findByRole("option", { name: '1 · 12 1/4"' }));

    expect((await picker("Report")).textContent).toContain("#1");
    fireEvent.click(await picker("Report"));
    expect(screen.queryByRole("option", { name: /#2/ })).toBeNull();
  });
});
