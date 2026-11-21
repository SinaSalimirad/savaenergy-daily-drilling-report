import { beforeEach, describe, expect, it } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Dialog } from "@/components/ui/dialog";
import { PROJECT_FILTER_STORAGE_KEY } from "@/features/projects/project-filter";
import {
  makeProject,
  makeProjectsPage,
} from "@/features/projects/project-fixtures";
import {
  createPump,
  listProjects,
  resetApiClientMock,
} from "@/test/api-client-mock";
import { makePump } from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { PumpForm } from "./pump-form";

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
function renderForm(pump?: ReturnType<typeof makePump>) {
  return render(
    <Dialog open>
      <PumpForm pump={pump} onSaved={noop} />
    </Dialog>,
    { wrapper: QueryWrapper },
  );
}

const field = (label: string) =>
  screen.getByLabelText(label) as HTMLInputElement;

describe("PumpForm", () => {
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

  it("fills the fields of the pump being edited", () => {
    renderForm(makePump({ model: "FH 1600", efficiency: 97.5 }));

    expect(field("Model").value).toBe("FH 1600");
    expect(field("Efficiency (%)").value).toBe("97.5");
    expect(field("Liner diameter (in)").value).toBe("6");
    expect(field("Row").value).toBe("1");
  });

  it("sends numbers, and leaves the row out when it is blank", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p1");
    createPump.mockResolvedValue({ data: { data: makePump() }, error: null });
    renderForm();
    await waitFor(() => expect(listProjects).toHaveBeenCalled());

    fireEvent.change(field("Model"), { target: { value: "FH 1500" } });
    fireEvent.change(field("Liner diameter (in)"), {
      target: { value: "6.5" },
    });
    fireEvent.change(field("Stroke length (in)"), { target: { value: "12" } });
    fireEvent.change(field("Efficiency (%)"), { target: { value: "95" } });
    fireEvent.click(screen.getByRole("button", { name: "Create pump" }));

    await waitFor(() => expect(createPump).toHaveBeenCalledTimes(1));
    expect(createPump.mock.calls[0]?.[0]).toEqual({
      project_id: "p1",
      model: "FH 1500",
      type: "triplex",
      liner_diameter: 6.5,
      rod_diameter: null,
      stroke_length: 12,
      efficiency: 95,
    });
  });

  it("asks for a rod diameter only for a duplex pump", () => {
    const { rerender } = renderForm(makePump({ type: "triplex" }));
    expect(screen.queryByLabelText("Rod diameter (in)")).toBeNull();

    rerender(
      <Dialog open>
        <PumpForm
          pump={makePump({ type: "duplex", rod_diameter: 2 })}
          onSaved={noop}
        />
      </Dialog>,
    );

    expect(field("Rod diameter (in)").value).toBe("2");
  });

  it("shows the message of the API next to the field", async () => {
    localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p1");
    createPump.mockResolvedValue({
      data: null,
      error: {
        status: 409,
        value: {
          code: "PUMP_SORT_ORDER_TAKEN",
          message: "This project already has a pump with this order.",
        },
      },
    });
    renderForm();
    await waitFor(() => expect(listProjects).toHaveBeenCalled());

    fireEvent.change(field("Row"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Create pump" }));

    expect(
      await screen.findByText(
        "This project already has a pump with this order.",
      ),
    ).toBeTruthy();
  });
});
