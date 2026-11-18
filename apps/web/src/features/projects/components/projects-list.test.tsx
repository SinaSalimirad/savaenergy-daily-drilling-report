import { beforeEach, describe, expect, it } from "bun:test";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { listProjects, resetApiClientMock } from "@/test/api-client-mock";
import {
  QueryWrapper,
  resetTestQueryClient,
  testQueryClient,
} from "@/test/query-wrapper";
import { makeProject, makeProjectsPage } from "../project-fixtures";
import { ProjectsList } from "./projects-list";

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
});

function respondWith(page: ReturnType<typeof makeProjectsPage>) {
  listProjects.mockResolvedValue({ data: page, error: null });
}

function renderList(props: { archived?: boolean; emptyMessage?: string } = {}) {
  return render(
    <ProjectsList
      archived={props.archived ?? false}
      emptyMessage={props.emptyMessage ?? "No projects yet."}
    />,
    { wrapper: QueryWrapper },
  );
}

describe("ProjectsList", () => {
  it("shows a skeleton table until the first page arrives", () => {
    // A promise that never settles keeps the query pending.
    listProjects.mockReturnValue(new Promise(() => {}));

    renderList();

    expect(
      screen.getByRole("status", { name: "Loading projects" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("row").length).toBeGreaterThan(1);
    expect(screen.queryByText("No projects yet.")).toBeNull();
  });

  it("shows the projects once they load", async () => {
    respondWith(
      makeProjectsPage([makeProject({ name: "North Sea Campaign" })]),
    );

    renderList();

    expect(
      await screen.findByRole("cell", { name: "North Sea Campaign" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("status", { name: "Loading projects" }),
    ).toBeNull();
  });

  it("shows the API's error message and retries when Try again is clicked", async () => {
    listProjects.mockResolvedValueOnce({
      data: null,
      error: {
        status: 500,
        value: { code: "INTERNAL_ERROR", message: "Database is down" },
      },
    });
    renderList();

    expect(await screen.findByText("Database is down")).toBeTruthy();

    respondWith(
      makeProjectsPage([makeProject({ name: "North Sea Campaign" })]),
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("cell", { name: "North Sea Campaign" }),
    ).toBeTruthy();
    expect(listProjects).toHaveBeenCalledTimes(2);
  });

  it("asks for the archived list and shows the empty message when there are none", async () => {
    respondWith(makeProjectsPage([]));

    renderList({ archived: true, emptyMessage: "No archived projects." });

    expect(await screen.findByText("No archived projects.")).toBeTruthy();
    expect(listProjects).toHaveBeenCalledWith({
      query: { page: 1, pageSize: 10, archived: "true" },
    });
  });

  describe("pagination", () => {
    const button = (name: string) => screen.getByRole("button", { name });
    const isDisabled = (name: string) => button(name).hasAttribute("disabled");

    it("shows the total and the page count, even when everything fits on one page", async () => {
      respondWith(makeProjectsPage([makeProject()], 10));

      renderList();

      expect(await screen.findByText("Page 1 of 1")).toBeTruthy();
      expect(screen.getByText("10 project(s)")).toBeTruthy();
      expect(isDisabled("Go to next page")).toBe(true);
      expect(isDisabled("Go to last page")).toBe(true);
    });

    it("disables First and Previous on the first page", async () => {
      respondWith(makeProjectsPage([makeProject()], 25));

      renderList();

      expect(await screen.findByText("Page 1 of 3")).toBeTruthy();
      expect(isDisabled("Go to first page")).toBe(true);
      expect(isDisabled("Go to previous page")).toBe(true);
      expect(isDisabled("Go to next page")).toBe(false);
      expect(isDisabled("Go to last page")).toBe(false);
    });

    it("requests the next page when Next is clicked", async () => {
      respondWith(makeProjectsPage([makeProject()], 25));
      renderList();
      await screen.findByText("Page 1 of 3");

      fireEvent.click(button("Go to next page"));

      await waitFor(() =>
        expect(listProjects).toHaveBeenCalledWith({
          query: { page: 2, pageSize: 10, archived: "false" },
        }),
      );
      expect(await screen.findByText("Page 2 of 3")).toBeTruthy();
    });

    it("jumps to the last page and back to the first", async () => {
      respondWith(makeProjectsPage([makeProject()], 25));
      renderList();
      await screen.findByText("Page 1 of 3");

      fireEvent.click(button("Go to last page"));
      expect(await screen.findByText("Page 3 of 3")).toBeTruthy();
      expect(isDisabled("Go to next page")).toBe(true);

      fireEvent.click(button("Go to first page"));
      expect(await screen.findByText("Page 1 of 3")).toBeTruthy();
    });

    it("starts from the first page when the page size changes", async () => {
      respondWith(makeProjectsPage([makeProject()], 45));
      renderList();
      await screen.findByText("Page 1 of 5");
      fireEvent.click(button("Go to next page"));
      await screen.findByText("Page 2 of 5");

      const trigger = screen.getByRole("combobox", { name: "Rows per page" });
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      const option = await screen.findByRole("option", { name: "20" });
      fireEvent.keyDown(option, { key: "Enter" });

      await waitFor(() =>
        expect(listProjects).toHaveBeenLastCalledWith({
          query: { page: 1, pageSize: 20, archived: "false" },
        }),
      );
      expect(await screen.findByText("Page 1 of 3")).toBeTruthy();
    });

    it("steps back a page when the last row of the last page disappears", async () => {
      respondWith(makeProjectsPage([makeProject()], 11));
      renderList();
      await screen.findByText("Page 1 of 2");
      fireEvent.click(button("Go to next page"));
      await screen.findByText("Page 2 of 2");

      // The only project on page 2 gets archived: 10 projects remain, so page 2 no longer exists.
      respondWith(makeProjectsPage([makeProject()], 10));
      await act(() => testQueryClient.invalidateQueries());

      await waitFor(() =>
        expect(listProjects).toHaveBeenLastCalledWith({
          query: { page: 1, pageSize: 10, archived: "false" },
        }),
      );
      expect(await screen.findByText("Page 1 of 1")).toBeTruthy();
    });
  });
});
