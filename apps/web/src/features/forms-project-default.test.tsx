import { beforeEach, describe, expect, it } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { PROJECT_FILTER_STORAGE_KEY } from "@/features/projects/project-filter";
import {
  makeProject,
  makeProjectsPage,
} from "@/features/projects/project-fixtures";
import { DailyReportForm } from "@/features/reports/components/daily-report-form";
import { SectionForm } from "@/features/sections/components/section-form";
import { WellForm } from "@/features/wells/components/well-form";
import {
  listProjects,
  listWells,
  resetApiClientMock,
} from "@/test/api-client-mock";
import { openCombobox } from "@/test/combobox";
import { makeReport, makeWell, page } from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";

const NORTH = makeProject({ id: "p1", name: "North Sea" });
const SOUTH = makeProject({ id: "p2", name: "South Pars" });

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
  localStorage.clear();
  listProjects.mockResolvedValue({
    data: makeProjectsPage([NORTH, SOUTH]),
    error: null,
  });
  listWells.mockResolvedValue(
    page([
      makeWell({
        id: "w1",
        name: "NS-1",
        project_id: "p1",
        project_name: "North Sea",
      }),
      makeWell({
        id: "w2",
        name: "SP14",
        project_id: "p2",
        project_name: "South Pars",
      }),
    ]),
  );
});

const noop = () => {};

// The forms sit in a dialog in the app (their Cancel button closes it).
function renderForm(form: ReactNode) {
  return render(<Dialog open>{form}</Dialog>, { wrapper: QueryWrapper });
}
const input = (placeholder: string) =>
  screen.getByPlaceholderText(placeholder) as HTMLInputElement;

describe("the project chosen in the header is the default of a new form", () => {
  it("fills the project of the section form, and offers only its wells by plain name", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p2");
    renderForm(<SectionForm onSaved={noop} />);

    await waitFor(() =>
      expect(input("Search for a project").value).toBe("South Pars"),
    );
    openCombobox(document.body, "Search for a well");

    expect(await screen.findByRole("option", { name: "SP14" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "NS-1" })).toBeNull();
    expect(screen.queryByRole("option", { name: /\(/ })).toBeNull(); // no "(project)" suffix
  });

  it("leaves the project of the section form empty when no project is chosen", async () => {
    renderForm(<SectionForm onSaved={noop} />);

    await waitFor(() => expect(listProjects).toHaveBeenCalled());
    expect(input("Search for a project").value).toBe("");
    expect(input("Select a project first")).toBeTruthy();
  });

  it("can still change the project in the section form (it is not disabled)", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p2");
    renderForm(<SectionForm onSaved={noop} />);
    await waitFor(() =>
      expect(input("Search for a project").value).toBe("South Pars"),
    );

    expect(input("Search for a project").disabled).toBe(false);
    openCombobox(document.body, "Search for a project");
    fireEvent.click(await screen.findByRole("option", { name: "North Sea" }));

    await waitFor(() =>
      expect(input("Search for a project").value).toBe("North Sea"),
    );
    openCombobox(document.body, "Search for a well");
    expect(await screen.findByRole("option", { name: "NS-1" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "SP14" })).toBeNull();
  });

  it("fills the project of the well form", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p1");
    renderForm(<WellForm onSaved={noop} />);

    await waitFor(() =>
      expect(input("Search for a project").value).toBe("North Sea"),
    );
    expect(input("Search for a project").disabled).toBe(false);
  });

  it("fills the project of the daily report form and offers its wells by plain name", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p1");
    renderForm(<DailyReportForm onSaved={noop} />);

    await waitFor(() =>
      expect(input("Search for a project").value).toBe("North Sea"),
    );
    openCombobox(document.body, "Search for a well");

    expect(await screen.findByRole("option", { name: "NS-1" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "SP14" })).toBeNull();
  });
});

describe("editing keeps the project of the record", () => {
  it("shows the project of the report's well and does not let it change", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p1");
    renderForm(
      <DailyReportForm
        report={makeReport({ well_id: "w2", well_name: "SP14" })}
        onSaved={noop}
      />,
    );

    await waitFor(() =>
      expect(input("Search for a project").value).toBe("South Pars"),
    );
    expect(input("Search for a project").disabled).toBe(true);
  });
});
