import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "@/components/ui/toast";
import {
  archiveProject,
  deleteProject,
  projectById,
  resetApiClientMock,
  restoreProject,
  updateProject,
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

  it("does not offer Edit for an archived project", async () => {
    render(
      <ProjectActionsMenu project={makeProject({ status: "archived" })} />,
      { wrapper: QueryWrapper },
    );

    openMenu("North Sea Campaign");

    await screen.findByRole("menuitem", { name: "Restore project" });
    expect(screen.queryByRole("menuitem", { name: "Edit project" })).toBeNull();
  });

  it("edits the project from a form filled with its current values", async () => {
    updateProject.mockResolvedValue({ data: { id: "p1" }, error: null });
    const addToast = spyOn(toast, "add");
    render(<ProjectActionsMenu project={makeProject({ id: "p1" })} />, {
      wrapper: QueryWrapper,
    });

    openMenu("North Sea Campaign");
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Edit project" }),
    );
    const name = (await screen.findByLabelText(
      "Project name",
    )) as HTMLInputElement;
    expect(name.value).toBe("North Sea Campaign");

    fireEvent.change(name, { target: { value: "Renamed" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({
        type: "success",
        title: "Project updated",
      }),
    );
    expect(projectById).toHaveBeenCalledWith({ id: "p1" });
    expect(updateProject).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Renamed", operator: "Sava Energy" }),
    );
  });

  it("shows the API message in the edit form when saving fails", async () => {
    updateProject.mockResolvedValue({
      data: null,
      error: {
        status: 409,
        value: { code: "PROJECT_NAME_TAKEN", message: "Name already used" },
      },
    });
    render(<ProjectActionsMenu project={makeProject()} />, {
      wrapper: QueryWrapper,
    });

    openMenu("North Sea Campaign");
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Edit project" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Save changes" }),
    );

    expect(await screen.findByText("Name already used")).toBeTruthy();
  });

  it("asks for confirmation before deleting, and deletes after it", async () => {
    deleteProject.mockResolvedValue({ data: null, error: null });
    const addToast = spyOn(toast, "add");
    render(<ProjectActionsMenu project={makeProject({ id: "p1" })} />, {
      wrapper: QueryWrapper,
    });

    openMenu("North Sea Campaign");
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Delete project" }),
    );
    // Clicking the menu item only opens the dialog.
    const confirm = await screen.findByRole("button", {
      name: "Delete project",
    });
    expect(deleteProject).not.toHaveBeenCalled();

    fireEvent.click(confirm);

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({
        type: "success",
        title: "Project deleted",
      }),
    );
    expect(projectById).toHaveBeenCalledWith({ id: "p1" });
  });

  it("shows the API message and no toast when deleting fails", async () => {
    deleteProject.mockResolvedValue({
      data: null,
      error: {
        status: 500,
        value: { code: "INTERNAL_ERROR", message: "Cannot delete" },
      },
    });
    const addToast = spyOn(toast, "add");
    render(<ProjectActionsMenu project={makeProject()} />, {
      wrapper: QueryWrapper,
    });

    openMenu("North Sea Campaign");
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Delete project" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete project" }),
    );

    expect(await screen.findByText("Cannot delete")).toBeTruthy();
    expect(addToast).not.toHaveBeenCalled();
  });
});
