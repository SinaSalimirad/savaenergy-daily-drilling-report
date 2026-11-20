import { beforeEach, describe, expect, it } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Dialog } from "@/components/ui/dialog";
import { PROJECT_FILTER_STORAGE_KEY } from "@/features/projects/project-filter";
import {
  makeProject,
  makeProjectsPage,
} from "@/features/projects/project-fixtures";
import {
  createSce,
  listProjects,
  resetApiClientMock,
} from "@/test/api-client-mock";
import { makeSce } from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { SceForm } from "./sce-form";

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
  localStorage.clear();
  listProjects.mockResolvedValue({
    data: makeProjectsPage([
      makeProject({ id: "p1", name: "North Sea" }),
      makeProject({ id: "p2", name: "South Pars" }),
    ]),
    error: null,
  });
});

const noop = () => {};

// The form sits in a dialog in the app (its Cancel button closes it).
function renderForm(sce?: ReturnType<typeof makeSce>) {
  return render(
    <Dialog open>
      <SceForm sce={sce} onSaved={noop} />
    </Dialog>,
    { wrapper: QueryWrapper },
  );
}

const field = (label: string) =>
  screen.getByLabelText(label) as HTMLInputElement;

describe("SceForm", () => {
  it("starts in the project chosen in the header", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p2");
    renderForm();

    await waitFor(() =>
      expect(
        (
          screen.getByPlaceholderText(
            "Search for a project",
          ) as HTMLInputElement
        ).value,
      ).toBe("South Pars"),
    );
  });

  it("fills the fields of the unit being edited, blank for what is empty", () => {
    renderForm(makeSce({ unit_no: 2, model: null }));

    expect(field("Row").value).toBe("1");
    expect(field("No.").value).toBe("2");
    expect(field("Manufactured by").value).toBe("Swaco");
    expect(field("Model").value).toBe("");
    expect(field("Screen size").value).toBe("140/140/140/140");
  });

  it("leaves the row and the number out when blank, and sends blank text as null", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p1");
    createSce.mockResolvedValue({ data: { data: makeSce() }, error: null });
    renderForm();
    await waitFor(() => expect(listProjects).toHaveBeenCalled());

    fireEvent.change(field("Manufactured by"), { target: { value: "Swaco" } });
    fireEvent.click(screen.getByRole("button", { name: "Create unit" }));

    await waitFor(() => expect(createSce).toHaveBeenCalledTimes(1));
    expect(createSce.mock.calls[0]?.[0]).toEqual({
      project_id: "p1",
      type: "shale_shaker",
      manufacturer: "Swaco",
      model: null,
      screen_size: null,
    });
  });

  it("shows a taken number next to its own field", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p1");
    createSce.mockResolvedValue({
      data: null,
      error: {
        status: 409,
        value: {
          code: "SCE_UNIT_NO_TAKEN",
          message:
            "This project already has a unit of this type with this number.",
        },
      },
    });
    renderForm();
    await waitFor(() => expect(listProjects).toHaveBeenCalled());

    fireEvent.change(field("No."), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Create unit" }));

    expect(
      await screen.findByText(
        "This project already has a unit of this type with this number.",
      ),
    ).toBeTruthy();
  });
});
