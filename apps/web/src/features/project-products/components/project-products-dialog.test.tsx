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
  makeProject,
  makeProjectsPage,
} from "@/features/projects/project-fixtures";
import {
  addProjectProduct,
  listProducts,
  listProjectProducts,
  listProjects,
  removeProjectProduct,
  resetApiClientMock,
  updateProjectProduct,
} from "@/test/api-client-mock";
import {
  failure,
  makeProduct,
  makeProjectProduct,
  page,
} from "@/test/fixtures";
import { QueryWrapper, resetTestQueryClient } from "@/test/query-wrapper";
import { ProjectProductsDialog } from "./project-products-dialog";

const BARITE = makeProjectProduct({ id: "pp-1", price: 60, origin: "local" });
const TARPAULIN = makeProjectProduct({
  id: "pp-2",
  price: null,
  origin: "foreign",
  product: makeProduct({
    id: "product-2",
    name: "Tarpaulin",
    kind: "dimensional",
    package_size: null,
    package_unit: null,
    specific_gravity: null,
    length_m: 10,
    width_m: 15,
  }),
});

beforeEach(() => {
  resetTestQueryClient();
  resetApiClientMock();
  localStorage.clear();
  listProjects.mockResolvedValue({
    data: makeProjectsPage([
      makeProject({ id: "p1", name: "North Sea", currency: "IRR" }),
    ]),
    error: null,
  });
  listProjectProducts.mockResolvedValue(page([BARITE, TARPAULIN]));
  listProducts.mockResolvedValue(page([BARITE.product, TARPAULIN.product]));
});

// The list opens from the arrow button inside the search box.
function openProductList(dialog: HTMLElement) {
  const input = within(dialog).getByPlaceholderText("Search for a product");
  const arrow = input
    .closest("[data-slot=input-group]")
    ?.querySelector("button");
  if (!arrow) throw new Error("No arrow button");
  fireEvent.click(arrow);
}

async function openDialog(projectId: string | null = "p1") {
  if (projectId) localStorage.setItem(PROJECT_FILTER_STORAGE_KEY, projectId);
  render(<ProjectProductsDialog />, { wrapper: QueryWrapper });
  fireEvent.click(screen.getByRole("button", { name: "Manage products" }));
  return screen.findByRole("dialog");
}

describe("ProjectProductsDialog", () => {
  it("asks to select a project first", async () => {
    const dialog = await openDialog(null);

    expect(within(dialog).getByText(/Select a project first/)).toBeTruthy();
    expect(listProjectProducts).not.toHaveBeenCalled();
  });

  it("lists the products of the project with package, origin and price", async () => {
    const dialog = await openDialog();

    const barite = await within(dialog).findByRole("row", { name: /Barite/ });
    expect(
      within(barite)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["Barite", "25 kg", "Local", "60", ""]);
    const tarpaulin = within(dialog).getByRole("row", { name: /Tarpaulin/ });
    expect(within(tarpaulin).getByText("10*15 m")).toBeTruthy();
    expect(within(tarpaulin).getByText("Foreign")).toBeTruthy();
    // No price yet: a dash.
    expect(within(tarpaulin).getAllByRole("cell")[3]?.textContent).toBe("—");
  });

  it("names the project currency in the price headers", async () => {
    const dialog = await openDialog();

    await within(dialog).findByRole("row", { name: /Barite/ });
    expect(within(dialog).getAllByText("Price (IRR)").length).toBeGreaterThan(
      0,
    );
  });

  it("shows a message when the project has no products", async () => {
    listProjectProducts.mockResolvedValue(page([]));

    const dialog = await openDialog();

    expect(
      await within(dialog).findByText("No products in this project yet."),
    ).toBeTruthy();
  });

  it("shows the error and lets the user try again", async () => {
    listProjectProducts.mockResolvedValueOnce(failure("Cannot load"));
    listProjectProducts.mockResolvedValue(page([BARITE]));

    const dialog = await openDialog();
    expect(await within(dialog).findByText("Cannot load")).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: "Try again" }));

    expect(
      await within(dialog).findByRole("row", { name: /Barite/ }),
    ).toBeTruthy();
  });

  describe("editing a row", () => {
    it("saves the new origin and price, then leaves edit mode", async () => {
      updateProjectProduct.mockResolvedValue({ data: BARITE, error: null });
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Edit Barite" }),
      );
      const price = within(dialog).getByLabelText("Price of Barite");
      expect((price as HTMLInputElement).value).toBe("60");
      fireEvent.change(price, { target: { value: "75.5" } });
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Save Barite" }),
      );

      await waitFor(() =>
        expect(updateProjectProduct).toHaveBeenCalledWith({
          origin: "local",
          price: 75.5,
        }),
      );
      await waitFor(() =>
        expect(within(dialog).queryByLabelText("Price of Barite")).toBeNull(),
      );
    });

    it("an empty price is sent as null", async () => {
      updateProjectProduct.mockResolvedValue({ data: BARITE, error: null });
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Edit Barite" }),
      );
      fireEvent.change(within(dialog).getByLabelText("Price of Barite"), {
        target: { value: "" },
      });
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Save Barite" }),
      );

      await waitFor(() =>
        expect(updateProjectProduct).toHaveBeenCalledWith({
          origin: "local",
          price: null,
        }),
      );
    });

    it("cancel leaves the row unchanged and sends nothing", async () => {
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Edit Barite" }),
      );
      fireEvent.change(within(dialog).getByLabelText("Price of Barite"), {
        target: { value: "1" },
      });
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Cancel editing" }),
      );

      expect(within(dialog).queryByLabelText("Price of Barite")).toBeNull();
      expect(updateProjectProduct).not.toHaveBeenCalled();
    });

    it("shows the message of the API under the price and stays in edit mode", async () => {
      updateProjectProduct.mockResolvedValue({
        data: null,
        error: {
          status: 422,
          value: {
            code: "VALIDATION_ERROR",
            message: "Invalid",
            errors: [
              { path: "/price", message: "Price must be greater than 0." },
            ],
          },
        },
      });
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Edit Barite" }),
      );
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Save Barite" }),
      );

      expect(
        await within(dialog).findByText("Price must be greater than 0."),
      ).toBeTruthy();
      expect(within(dialog).getByLabelText("Price of Barite")).toBeTruthy();
    });
  });

  describe("removing a row", () => {
    it("takes two clicks: the first one only asks", async () => {
      removeProjectProduct.mockResolvedValue({ data: null, error: null });
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Remove Barite" }),
      );

      expect(removeProjectProduct).not.toHaveBeenCalled();
      expect(
        within(dialog).getByRole("button", { name: "Confirm removing Barite" }),
      ).toBeTruthy();

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Confirm removing Barite" }),
      );

      await waitFor(() =>
        expect(removeProjectProduct).toHaveBeenCalledTimes(1),
      );
    });

    it("hides the edit icon while it waits for the confirmation", async () => {
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Remove Barite" }),
      );

      expect(
        within(dialog).queryByRole("button", { name: "Edit Barite" }),
      ).toBeNull();
      // The other row is not affected.
      expect(
        within(dialog).getByRole("button", { name: "Edit Tarpaulin" }),
      ).toBeTruthy();
    });

    it("cancel backs out without removing", async () => {
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Remove Barite" }),
      );
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Cancel removing" }),
      );

      expect(removeProjectProduct).not.toHaveBeenCalled();
      expect(
        within(dialog).getByRole("button", { name: "Remove Barite" }),
      ).toBeTruthy();
      expect(
        within(dialog).getByRole("button", { name: "Edit Barite" }),
      ).toBeTruthy();
    });

    it("goes back to the normal buttons when the API refuses", async () => {
      removeProjectProduct.mockResolvedValue(
        failure("Used in an inventory", 409),
      );
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Remove Barite" }),
      );
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Confirm removing Barite" }),
      );

      expect(
        await within(dialog).findByRole("button", { name: "Remove Barite" }),
      ).toBeTruthy();
    });
  });

  describe("adding a product", () => {
    it("offers only products the project does not use yet", async () => {
      const fresh = makeProduct({
        id: "product-3",
        name: "Salt",
        kind: "equipment",
        package_size: null,
        package_unit: null,
        specific_gravity: null,
      });
      listProducts.mockResolvedValue(
        page([BARITE.product, TARPAULIN.product, fresh]),
      );
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      openProductList(dialog);

      expect(await screen.findByRole("option", { name: "Salt" })).toBeTruthy();
      expect(screen.queryByRole("option", { name: "Barite" })).toBeNull();
    });

    it("cannot be submitted before a product is chosen", async () => {
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      const add = within(dialog).getByRole("button", { name: "Add product" });

      expect(add.hasAttribute("disabled")).toBe(true);
    });

    it("sends the project, the product, the origin and the price", async () => {
      addProjectProduct.mockResolvedValue({ data: BARITE, error: null });
      const fresh = makeProduct({
        id: "product-3",
        name: "Salt",
        kind: "equipment",
        package_size: null,
        package_unit: null,
        specific_gravity: null,
      });
      listProducts.mockResolvedValue(
        page([BARITE.product, TARPAULIN.product, fresh]),
      );
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      openProductList(dialog);
      fireEvent.click(await screen.findByRole("option", { name: "Salt" }));
      fireEvent.change(within(dialog).getByLabelText(/^Price/), {
        target: { value: "12.5" },
      });
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Add product" }),
      );

      await waitFor(() =>
        expect(addProjectProduct).toHaveBeenCalledWith({
          project_id: "p1",
          product_id: "product-3",
          origin: "local",
          price: 12.5,
        }),
      );
    });

    it("shows the error of the API under the form", async () => {
      addProjectProduct.mockResolvedValue(
        failure("This project already uses this product.", 409),
      );
      const fresh = makeProduct({
        id: "product-3",
        name: "Salt",
        kind: "equipment",
        package_size: null,
        package_unit: null,
        specific_gravity: null,
      });
      listProducts.mockResolvedValue(page([BARITE.product, fresh]));
      const dialog = await openDialog();
      await within(dialog).findByRole("row", { name: /Barite/ });

      openProductList(dialog);
      fireEvent.click(await screen.findByRole("option", { name: "Salt" }));
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Add product" }),
      );

      expect(
        await within(dialog).findByText(
          "This project already uses this product.",
        ),
      ).toBeTruthy();
    });
  });
});
