import { beforeEach, describe, expect, it } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { resetApiClientMock } from "@/test/api-client-mock";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { makeProject } from "../project-fixtures";
import { ProjectsTable } from "./projects-table";

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
});

describe("ProjectsTable", () => {
  it("shows a header for every column", () => {
    render(<ProjectsTable data={[]} emptyMessage="Nothing here." />, {
      wrapper: QueryWrapper,
    });

    for (const header of [
      "Project",
      "Operator(s)",
      "Contractor(s)",
      "Field",
      "Currency",
      "Wells",
      "Status",
      "Actions",
    ]) {
      expect(screen.getByRole("columnheader", { name: header })).toBeTruthy();
    }
  });

  it("shows the number of wells of each project", () => {
    render(
      <ProjectsTable
        data={[makeProject({ wells: 12 })]}
        emptyMessage="Nothing here."
      />,
      { wrapper: QueryWrapper },
    );

    expect(screen.getByRole("cell", { name: "12" })).toBeTruthy();
  });

  it("shows one row per project with its details", () => {
    const projects = [
      makeProject({ id: "1", name: "North Sea Campaign" }),
      makeProject({ id: "2", name: "Persian Gulf Campaign", field: "Beta" }),
    ];

    render(<ProjectsTable data={projects} emptyMessage="Nothing here." />, {
      wrapper: QueryWrapper,
    });

    // One header row plus one row per project.
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(
      screen.getByRole("cell", { name: "North Sea Campaign" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("cell", { name: "Persian Gulf Campaign" }),
    ).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Beta" })).toBeTruthy();
  });

  it("shows the status as text", () => {
    render(
      <ProjectsTable
        data={[makeProject({ status: "inactive" })]}
        emptyMessage="Nothing here."
      />,
      { wrapper: QueryWrapper },
    );

    expect(screen.getByRole("cell", { name: "inactive" })).toBeTruthy();
  });

  it("shows the empty message instead of rows when there are no projects", () => {
    render(<ProjectsTable data={[]} emptyMessage="No archived projects." />, {
      wrapper: QueryWrapper,
    });

    expect(screen.getByText("No archived projects.")).toBeTruthy();
    // Only the header row remains, plus the single message row.
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  it("gives each row an actions button named after its project", () => {
    render(
      <ProjectsTable
        data={[makeProject({ name: "North Sea Campaign" })]}
        emptyMessage="Nothing here."
      />,
      { wrapper: QueryWrapper },
    );

    expect(
      screen.getByRole("button", { name: "Actions for North Sea Campaign" }),
    ).toBeTruthy();
  });

  it("builds each row's actions menu from that row's own project", async () => {
    const projects = [
      makeProject({ id: "1", name: "Active Project", status: "active" }),
      makeProject({ id: "2", name: "Archived Project", status: "archived" }),
    ];
    render(<ProjectsTable data={projects} emptyMessage="Nothing here." />, {
      wrapper: QueryWrapper,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Actions for Archived Project" }),
    );

    expect(
      await screen.findByRole("menuitem", { name: "Restore project" }),
    ).toBeTruthy();
  });

  it("shows the currency of each project", () => {
    render(
      <ProjectsTable
        data={[
          makeProject({ id: "1", name: "A", currency: "USD" }),
          makeProject({ id: "2", name: "B", currency: "IRR" }),
        ]}
        emptyMessage="Nothing here."
      />,
      { wrapper: QueryWrapper },
    );

    expect(screen.getByRole("cell", { name: "USD" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "IRR" })).toBeTruthy();
  });

  it("shows the status as a badge with its own colour", () => {
    render(
      <ProjectsTable
        data={[
          makeProject({ id: "1", name: "A", status: "active" }),
          makeProject({ id: "2", name: "B", status: "inactive" }),
        ]}
        emptyMessage="Nothing here."
      />,
      { wrapper: QueryWrapper },
    );

    const active = screen.getByText("active");
    const inactive = screen.getByText("inactive");
    expect(active.className).toContain("rounded-full");
    expect(active.className).not.toBe(inactive.className);
  });
});
