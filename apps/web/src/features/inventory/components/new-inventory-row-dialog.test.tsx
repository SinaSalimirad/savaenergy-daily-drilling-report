import { beforeEach, describe, expect, it } from "bun:test";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { PROJECT_FILTER_STORAGE_KEY } from "@/features/projects/project-filter";
import {
  createInventory,
  listProjectProducts,
  resetApiClientMock,
} from "@/test/api-client-mock";
import { openCombobox } from "@/test/combobox";
import {
  failure,
  makeInventoryRow,
  makeProduct,
  makeProjectProduct,
  page,
} from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { NewInventoryRowDialog } from "./new-inventory-row-dialog";

const BARITE = makeProjectProduct({ id: "pp-1" });
const SALT = makeProjectProduct({
  id: "pp-2",
  product: makeProduct({ id: "product-2", name: "Salt" }),
});

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
  localStorage.clear();
  localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, "p1");
  listProjectProducts.mockResolvedValue(page([BARITE, SALT]));
});

async function openDialog(existing: string[] = []) {
  render(
    <NewInventoryRowDialog
      reportId="report-1"
      existingProjectProductIds={existing}
    />,
    {
      wrapper: QueryWrapper,
    },
  );
  fireEvent.click(screen.getByRole("button", { name: "New row" }));
  const dialog = await screen.findByRole("dialog");
  await waitFor(() => expect(listProjectProducts).toHaveBeenCalled());
  return dialog;
}

async function pick(dialog: HTMLElement, name: string) {
  openCombobox(dialog, "Search for a product");
  fireEvent.click(await screen.findByRole("option", { name }));
}

describe("NewInventoryRowDialog", () => {
  it("offers the products of the project", async () => {
    const dialog = await openDialog();

    openCombobox(dialog, "Search for a product");

    expect(await screen.findByRole("option", { name: "Barite" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Salt" })).toBeTruthy();
  });

  it("does not offer products that already have a row in this report", async () => {
    const dialog = await openDialog(["pp-1"]);

    openCombobox(dialog, "Search for a product");

    expect(await screen.findByRole("option", { name: "Salt" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Barite" })).toBeNull();
  });

  it("cannot be created before a product is chosen", async () => {
    const dialog = await openDialog();

    expect(
      within(dialog)
        .getByRole("button", { name: "Create row" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("sends only the product when the numbers are left empty", async () => {
    createInventory.mockResolvedValue({
      data: makeInventoryRow(),
      error: null,
    });
    const dialog = await openDialog();

    await pick(dialog, "Barite");
    fireEvent.click(within(dialog).getByRole("button", { name: "Create row" }));

    await waitFor(() =>
      expect(createInventory).toHaveBeenCalledWith({
        report_id: "report-1",
        project_product_id: "pp-1",
      }),
    );
  });

  it("sends the four numbers that were typed", async () => {
    createInventory.mockResolvedValue({
      data: makeInventoryRow(),
      error: null,
    });
    const dialog = await openDialog();

    await pick(dialog, "Barite");
    fireEvent.change(within(dialog).getByLabelText("Initial stock"), {
      target: { value: "100" },
    });
    fireEvent.change(within(dialog).getByLabelText("Received"), {
      target: { value: "5" },
    });
    fireEvent.change(within(dialog).getByLabelText("Used"), {
      target: { value: "0" },
    });
    fireEvent.change(within(dialog).getByLabelText("Returned"), {
      target: { value: "2" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Create row" }));

    await waitFor(() =>
      expect(createInventory).toHaveBeenCalledWith({
        report_id: "report-1",
        project_product_id: "pp-1",
        initial: 100,
        received: 5,
        used: 0, // a typed zero is sent: it is a value, not an empty field
        returned: 2,
      }),
    );
  });

  it("shows the error of a field under that field and keeps the dialog open", async () => {
    createInventory.mockResolvedValue({
      data: null,
      error: {
        status: 422,
        value: {
          code: "VALIDATION_ERROR",
          message: "Invalid",
          errors: [{ path: "/used", message: "Used cannot be negative." }],
        },
      },
    });
    const dialog = await openDialog();

    await pick(dialog, "Barite");
    fireEvent.click(within(dialog).getByRole("button", { name: "Create row" }));

    expect(
      await within(dialog).findByText("Used cannot be negative."),
    ).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("shows another error (a duplicate) under the form", async () => {
    createInventory.mockResolvedValue(
      failure("This product is already in the inventory of this report.", 409),
    );
    const dialog = await openDialog();

    await pick(dialog, "Barite");
    fireEvent.click(within(dialog).getByRole("button", { name: "Create row" }));

    expect(
      await within(dialog).findByText(
        "This product is already in the inventory of this report.",
      ),
    ).toBeTruthy();
  });

  it("explains an empty project", async () => {
    listProjectProducts.mockResolvedValue(page([]));
    const dialog = await openDialog();

    openCombobox(dialog, "Search for a product");

    expect(await screen.findByText(/no products yet/)).toBeTruthy();
  });
});
