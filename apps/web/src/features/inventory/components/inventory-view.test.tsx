import { beforeEach, describe, expect, it } from "bun:test";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { PROJECT_FILTER_STORAGE_KEY } from "@/features/projects/project-filter";
import {
  makeProject,
  makeProjectsPage,
} from "@/features/projects/project-fixtures";
import {
  listDailyReports,
  listInventory,
  listProducts,
  listProjectProducts,
  listProjects,
  resetApiClientMock,
} from "@/test/api-client-mock";
import { failure, makeInventoryRow, makeReport, page } from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { InventoryView } from "./inventory-view";

// Newest first, as the API lists them: two wells, two reports for the first one.
const REPORTS = [
  makeReport({
    id: "r3",
    well_id: "w1",
    well_name: "SP14",
    report_no: 3,
    report_date: "2026-11-22",
  }),
  makeReport({
    id: "r2",
    well_id: "w2",
    well_name: "SP15",
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
  listInventory.mockResolvedValue(page([makeInventoryRow()]));
  listProjectProducts.mockResolvedValue(page([]));
  listProducts.mockResolvedValue(page([]));
});

function renderView(projectId: string | null = "p1") {
  if (projectId) localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, projectId);
  return render(<InventoryView />, { wrapper: QueryWrapper });
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

describe("InventoryView", () => {
  it("asks to select a project when none is chosen", () => {
    renderView(null);

    expect(
      screen.getByText("Select a project to see its inventory."),
    ).toBeTruthy();
    expect(listDailyReports).not.toHaveBeenCalled();
  });

  it("explains that a project without reports has no inventory yet", async () => {
    listDailyReports.mockResolvedValue(page([]));

    renderView();

    expect(await screen.findByText(/no daily reports yet/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "New row" })).toBeNull();
  });

  it("shows the error of the reports and lets the user try again", async () => {
    listDailyReports.mockResolvedValueOnce(failure("Cannot load reports"));

    renderView();

    expect(await screen.findByText("Cannot load reports")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await picker("Well")).toBeTruthy();
  });

  it("opens the newest report of the first well, with its inventory", async () => {
    renderView();

    expect((await picker("Well")).textContent).toContain("SP14");
    expect((await picker("Report")).textContent).toContain("#3");
    await waitFor(() =>
      expect(listInventory).toHaveBeenCalledWith({
        query: { report_id: "r3" },
      }),
    );
    expect(await screen.findByRole("row", { name: /Barite/ })).toBeTruthy();
  });

  it("asks the API for the project's reports only", async () => {
    renderView();

    await picker("Well");

    expect(listDailyReports).toHaveBeenCalledWith({
      query: { page: 1, pageSize: 100, project_id: "p1" },
    });
  });

  it("lists each well once, and only the reports of the chosen well", async () => {
    renderView();
    fireEvent.click(await picker("Well"));

    const wells = await screen.findAllByRole("option");
    expect(wells.map((option) => option.textContent)).toEqual(["SP14", "SP15"]);
  });

  it("lists the reports of the chosen well with their dates", async () => {
    renderView();
    fireEvent.click(await picker("Report"));

    const reports = await screen.findAllByRole("option");
    expect(reports.map((option) => option.textContent)).toEqual([
      "#3 · 2026-11-22",
      "#1 · 2026-11-20",
    ]);
  });

  it("choosing another well opens that well's newest report", async () => {
    renderView();
    fireEvent.click(await picker("Well"));
    choose(await screen.findByRole("option", { name: "SP15" }));

    await waitFor(() =>
      expect(listInventory).toHaveBeenCalledWith({
        query: { report_id: "r2" },
      }),
    );
    expect((await picker("Report")).textContent).toContain("#2");
  });

  it("choosing another report of the same well loads its inventory", async () => {
    renderView();
    fireEvent.click(await picker("Report"));
    choose(await screen.findByRole("option", { name: "#1 · 2026-11-20" }));

    await waitFor(() =>
      expect(listInventory).toHaveBeenCalledWith({
        query: { report_id: "r1" },
      }),
    );
  });

  it("explains an empty report", async () => {
    listInventory.mockResolvedValue(page([]));

    renderView();

    expect(
      await screen.findByText(/No products in this report yet/),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "New row" })).toBeTruthy();
  });

  it("shows the error of the inventory and lets the user try again", async () => {
    listInventory.mockResolvedValueOnce(failure("Cannot load inventory"));

    renderView();

    const message = await screen.findByText("Cannot load inventory");
    fireEvent.click(
      within(message.parentElement as HTMLElement).getByRole("button", {
        name: "Try again",
      }),
    );
    expect(await screen.findByRole("row", { name: /Barite/ })).toBeTruthy();
  });

  it("has the project select, Manage products and New row beside the title", async () => {
    renderView();

    expect(
      await screen.findByRole("button", { name: "Manage products" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "Filter by project" }),
    ).toBeTruthy();
    expect(await screen.findByRole("button", { name: "New row" })).toBeTruthy();
  });
});
