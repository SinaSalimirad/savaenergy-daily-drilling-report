import { beforeEach, describe, expect, it } from "bun:test";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  deleteInventory,
  resetApiClientMock,
  updateInventory,
} from "@/test/api-client-mock";
import { failure, makeInventoryRow } from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { DeleteInventoryRowDialog } from "./delete-inventory-row-dialog";
import { EditInventoryRowDialog } from "./edit-inventory-row-dialog";
import { InventoryRowActions } from "./inventory-row-actions";

const ROW = makeInventoryRow({
  id: "row-9",
  initial_stock: 10,
  daily_received: 4,
  daily_used: 3,
  daily_returned: 1,
});

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
});

describe("EditInventoryRowDialog", () => {
  function renderEdit(onOpenChange: (open: boolean) => void = () => {}) {
    render(
      <EditInventoryRowDialog row={ROW} open onOpenChange={onOpenChange} />,
      { wrapper: QueryWrapper },
    );
    return screen.getByRole("dialog");
  }

  it("starts from the current numbers of the row", () => {
    const dialog = renderEdit();

    const value = (label: string) =>
      (within(dialog).getByLabelText(label) as HTMLInputElement).value;
    expect(value("Initial stock")).toBe("10");
    expect(value("Received")).toBe("4");
    expect(value("Used")).toBe("3");
    expect(value("Returned")).toBe("1");
  });

  it("sends the four numbers and closes", async () => {
    updateInventory.mockResolvedValue({ data: ROW, error: null });
    const closed: boolean[] = [];
    const dialog = renderEdit((open) => closed.push(open));

    fireEvent.change(within(dialog).getByLabelText("Used"), {
      target: { value: "7" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save changes" }),
    );

    await waitFor(() =>
      expect(updateInventory).toHaveBeenCalledWith({
        initial: 10,
        received: 4,
        used: 7,
        returned: 1,
      }),
    );
    await waitFor(() => expect(closed).toContain(false));
  });

  it("shows the message of the API under the field", async () => {
    updateInventory.mockResolvedValue({
      data: null,
      error: {
        status: 422,
        value: {
          code: "VALIDATION_ERROR",
          message: "Invalid",
          errors: [
            { path: "/received", message: "Received cannot be negative." },
          ],
        },
      },
    });
    const dialog = renderEdit();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save changes" }),
    );

    expect(
      await within(dialog).findByText("Received cannot be negative."),
    ).toBeTruthy();
  });
});

describe("DeleteInventoryRowDialog", () => {
  it("names the product and removes the row after the click", async () => {
    deleteInventory.mockResolvedValue({ data: null, error: null });
    render(
      <DeleteInventoryRowDialog row={ROW} open onOpenChange={() => {}} />,
      { wrapper: QueryWrapper },
    );
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Barite")).toBeTruthy();
    expect(deleteInventory).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove row" }));

    await waitFor(() => expect(deleteInventory).toHaveBeenCalledTimes(1));
  });

  it("shows the error and stays open", async () => {
    deleteInventory.mockResolvedValue(failure("Cannot remove", 409));
    render(
      <DeleteInventoryRowDialog row={ROW} open onOpenChange={() => {}} />,
      { wrapper: QueryWrapper },
    );
    const dialog = screen.getByRole("dialog");

    fireEvent.click(within(dialog).getByRole("button", { name: "Remove row" }));

    expect(await within(dialog).findByText("Cannot remove")).toBeTruthy();
  });
});

describe("InventoryRowActions", () => {
  it("opens the edit and the remove dialogs from the menu", async () => {
    render(<InventoryRowActions row={ROW} />, { wrapper: QueryWrapper });

    fireEvent.click(screen.getByRole("button", { name: "Actions for Barite" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Edit row" }));
    expect(
      await screen.findByRole("heading", { name: "Edit inventory row" }),
    ).toBeTruthy();
  });
});
