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
  it("shows a loading message until the first page arrives", () => {
    // A promise that never settles keeps the query pending.
    listProjects.mockReturnValue(new Promise(() => {}));

    renderList();

    expect(screen.getByText("Loading projects…")).toBeTruthy();
  });

  it("shows the projects once they load", async () => {
    respondWith(
      makeProjectsPage([makeProject({ name: "North Sea Campaign" })]),
    );

    renderList();

    expect(
      await screen.findByRole("cell", { name: "North Sea Campaign" }),
    ).toBeTruthy();
    expect(screen.queryByText("Loading projects…")).toBeNull();
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
    it("hides the pager when everything fits on one page", async () => {
      respondWith(makeProjectsPage([makeProject()], 10));

      renderList();
      await screen.findByRole("cell", { name: "North Sea Campaign" });

      expect(screen.queryByText(/^Page /)).toBeNull();
    });

    it("shows the page count and disables Previous on the first page", async () => {
      respondWith(makeProjectsPage([makeProject()], 25));

      renderList();

      expect(await screen.findByText("Page 1 of 3")).toBeTruthy();
      expect(
        screen
          .getByRole("button", { name: "Previous" })
          .hasAttribute("disabled"),
      ).toBe(true);
      expect(
        screen.getByRole("button", { name: "Next" }).hasAttribute("disabled"),
      ).toBe(false);
    });

    it("requests the next page when Next is clicked", async () => {
      respondWith(makeProjectsPage([makeProject()], 25));
      renderList();
      await screen.findByText("Page 1 of 3");

      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      await waitFor(() =>
        expect(listProjects).toHaveBeenCalledWith({
          query: { page: 2, pageSize: 10, archived: "false" },
        }),
      );
      expect(await screen.findByText("Page 2 of 3")).toBeTruthy();
    });

    it("disables Next on the last page", async () => {
      respondWith(makeProjectsPage([makeProject()], 11));
      renderList();
      await screen.findByText("Page 1 of 2");

      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      await screen.findByText("Page 2 of 2");
      expect(
        screen.getByRole("button", { name: "Next" }).hasAttribute("disabled"),
      ).toBe(true);
    });

    it("steps back a page when the last row of the last page disappears", async () => {
      respondWith(makeProjectsPage([makeProject()], 11));
      renderList();
      await screen.findByText("Page 1 of 2");
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      await screen.findByText("Page 2 of 2");

      // The only project on page 2 gets archived: 10 projects remain, so page 2 no longer exists.
      respondWith(makeProjectsPage([makeProject()], 10));
      await act(() => testQueryClient.invalidateQueries());

      await waitFor(() =>
        expect(listProjects).toHaveBeenLastCalledWith({
          query: { page: 1, pageSize: 10, archived: "false" },
        }),
      );
      expect(screen.queryByText(/^Page /)).toBeNull();
    });
  });
});
