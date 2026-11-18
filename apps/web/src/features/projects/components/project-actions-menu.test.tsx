import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "@/components/ui/toast";
import {
  archiveProject,
  projectById,
  resetApiClientMock,
  restoreProject,
} from "@/test/api-client-mock";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { makeProject } from "../project-fixtures";
import { ProjectActionsMenu } from "./project-actions-menu";

beforeEach(() => {
  resetTestQueryClient();
  mock.restore();
  resetApiClientMock();
});

function openMenu(projectName: string) {
  fireEvent.click(
    screen.getByRole("button", { name: `Actions for ${projectName}` }),
  );
}

describe("ProjectActionsMenu", () => {
  it("offers Archive, not Restore, for a project that is not archived", async () => {
    render(<ProjectActionsMenu project={makeProject({ status: "active" })} />, {
      wrapper: QueryWrapper,
    });

    openMenu("North Sea Campaign");

    expect(
      await screen.findByRole("menuitem", { name: "Archive project" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("menuitem", { name: "Restore project" }),
    ).toBeNull();
  });

  it("offers Restore, not Archive, for an archived project", async () => {
    render(
      <ProjectActionsMenu project={makeProject({ status: "archived" })} />,
      { wrapper: QueryWrapper },
    );

    openMenu("North Sea Campaign");

    expect(
      await screen.findByRole("menuitem", { name: "Restore project" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("menuitem", { name: "Archive project" }),
    ).toBeNull();
  });

  it("archives the project and confirms with a toast", async () => {
    archiveProject.mockResolvedValue({ data: { id: "p1" }, error: null });
    const addToast = spyOn(toast, "add");
    render(
      <ProjectActionsMenu
        project={makeProject({ id: "p1", status: "active" })}
      />,
      { wrapper: QueryWrapper },
    );

    openMenu("North Sea Campaign");
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Archive project" }),
    );

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({
        type: "success",
        title: "Project archived",
      }),
    );
    expect(projectById).toHaveBeenCalledWith({ id: "p1" });
  });

  it("restores the project and confirms with a toast", async () => {
    restoreProject.mockResolvedValue({ data: { id: "p1" }, error: null });
    const addToast = spyOn(toast, "add");
    render(
      <ProjectActionsMenu
        project={makeProject({ id: "p1", status: "archived" })}
      />,
      { wrapper: QueryWrapper },
    );

    openMenu("North Sea Campaign");
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Restore project" }),
    );

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({
        type: "success",
        title: "Project restored",
      }),
    );
    expect(projectById).toHaveBeenCalledWith({ id: "p1" });
  });

  it("does not show the success toast when archiving fails", async () => {
    archiveProject.mockResolvedValue({
      data: null,
      error: {
        status: 500,
        value: { code: "INTERNAL_ERROR", message: "Boom" },
      },
    });
    const addToast = spyOn(toast, "add");
    render(<ProjectActionsMenu project={makeProject({ status: "active" })} />, {
      wrapper: QueryWrapper,
    });

    openMenu("North Sea Campaign");
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Archive project" }),
    );

    await waitFor(() => expect(archiveProject).toHaveBeenCalledTimes(1));
    expect(addToast).not.toHaveBeenCalled();
  });
});
