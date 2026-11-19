import { beforeEach, describe, expect, it } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { listProjects, resetApiClientMock } from "@/test/api-client-mock";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import {
  PROJECT_FILTER_STORAGE_KEY,
  useProjectFilter,
} from "../project-filter";
import { makeProject, makeProjectsPage } from "../project-fixtures";
import { ProjectFilterSelect } from "./project-filter-select";

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
  localStorage.clear();
});

function respondWith(
  projects = [makeProject({ id: "p1", name: "North Sea" })],
) {
  listProjects.mockResolvedValue({
    data: makeProjectsPage(projects),
    error: null,
  });
}

// Shows what the context holds, so a test can read it without a page that uses the filter.
function CurrentProject() {
  const { projectId } = useProjectFilter();
  return <p data-testid="current">{projectId ?? "all"}</p>;
}

function renderSelect() {
  return render(
    <>
      <ProjectFilterSelect />
      <CurrentProject />
    </>,
    { wrapper: QueryWrapper },
  );
}

describe("ProjectFilterSelect", () => {
  it("asks to select a project when none is chosen", () => {
    respondWith();

    renderSelect();

    const trigger = screen.getByRole("combobox", { name: "Filter by project" });
    expect(trigger.textContent).toBe("Select Project");
    expect(screen.getByTestId("current").textContent).toBe("all");
  });

  it("restores the project saved from the last visit", async () => {
    respondWith();
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p1");

    renderSelect();

    await waitFor(() =>
      expect(
        screen.getByRole("combobox", { name: "Filter by project" }).textContent,
      ).toBe("North Sea"),
    );
    expect(screen.getByTestId("current").textContent).toBe("p1");
  });

  it("filters by a project picked from the list, and clears it with 'All projects'", async () => {
    respondWith();
    renderSelect();
    const trigger = screen.getByRole("combobox", { name: "Filter by project" });

    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole("option", { name: "North Sea" }));

    await waitFor(() =>
      expect(screen.getByTestId("current").textContent).toBe("p1"),
    );
    expect(localStorage.getItem(PROJECT_FILTER_STORAGE_KEY)).toBe("p1");

    fireEvent.click(trigger);
    fireEvent.click(
      await screen.findByRole("option", { name: "All projects" }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("current").textContent).toBe("all"),
    );
    expect(localStorage.getItem(PROJECT_FILTER_STORAGE_KEY)).toBeNull();
  });

  it("falls back to all projects when the saved project no longer exists", async () => {
    respondWith();
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "deleted-project");

    renderSelect();

    await waitFor(() =>
      expect(screen.getByTestId("current").textContent).toBe("all"),
    );
    expect(localStorage.getItem(PROJECT_FILTER_STORAGE_KEY)).toBeNull();
  });

  it("is disabled when the projects cannot be loaded", async () => {
    listProjects.mockResolvedValue({
      data: null,
      error: { status: 500, value: { message: "boom" } },
    });

    renderSelect();

    await waitFor(() =>
      expect(
        screen
          .getByRole("combobox", { name: "Filter by project" })
          .hasAttribute("disabled"),
      ).toBe(true),
    );
  });
});
