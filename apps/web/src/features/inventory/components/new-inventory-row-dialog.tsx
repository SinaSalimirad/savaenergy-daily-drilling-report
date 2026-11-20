"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProjectProducts } from "@/features/project-products/api";
import { packageText } from "@/features/project-products/labels";
import { useProjectFilter } from "@/features/projects/project-filter";
import type { InventoryRow } from "../types";

type ProductOption = { value: string; label: string };

// A new row starts with nothing received or used; the numbers fill in from the daily reports.
function emptyRow(
  item: NonNullable<
    ReturnType<typeof useProjectProducts>["data"]
  >["data"][number],
): InventoryRow {
  return {
    product_id: item.product_id,
    name: item.product.name,
    package: packageText(item.product),
    unit_price: item.price,
    initial_stock: 0,
    daily_received: 0,
    daily_used: 0,
    section_used: 0,
    monthly_received: 0,
    monthly_used: 0,
    cumulative_received: 0,
    cumulative_used: 0,
    cumulative_returned: 0,
    final_stock: 0,
    daily_cost: null,
  };
}

/**
 * Adds a row to the inventory. The product is chosen from the products of the selected
 * project ("Products of project"), so the inventory only lists what the project uses.
 */
export function NewInventoryRowDialog({
  existingNames,
  onCreate,
}: {
  // Products that already have a row are not offered again.
  existingNames: string[];
  onCreate: (row: InventoryRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ProductOption | null>(null);
  const { projectId } = useProjectFilter();
  const projectProducts = useProjectProducts(projectId);

  const available = (projectProducts.data?.data ?? []).filter(
    (item) => !existingNames.includes(item.product.name),
  );
  const options: ProductOption[] = available.map((item) => ({
    value: item.id,
    label: item.product.name,
  }));

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setSelected(null);
  }

  function handleCreate() {
    const item = available.find(
      (candidate) => candidate.id === selected?.value,
    );
    if (!item) return;
    onCreate(emptyRow(item));
    handleOpenChange(false);
  }

  let emptyMessage =
    "All products of this project are already in the inventory.";
  if (projectProducts.isPending) emptyMessage = "Loading products…";
  else if (
    options.length === 0 &&
    (projectProducts.data?.data.length ?? 0) === 0
  )
    emptyMessage =
      "This project has no products yet. Add them in “Products of project”.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button className="h-10 px-4 font-medium text-card" />}
      >
        <PlusIcon data-icon="inline-start" />
        New row
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New row</DialogTitle>
          <DialogDescription>
            Choose a product from the products of the project.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 px-4">
          {projectId === null ? (
            <p className="text-muted-foreground">Select a project first.</p>
          ) : (
            <>
              <label
                htmlFor="inventory-row-product"
                className="font-medium text-sm"
              >
                Product
              </label>
              <Combobox
                items={options}
                value={selected}
                onValueChange={(option: ProductOption | null) =>
                  setSelected(option)
                }
              >
                <ComboboxInput
                  id="inventory-row-product"
                  className="h-9 w-full rounded-md bg-transparent shadow-xs"
                  placeholder="Search for a product"
                />
                <ComboboxContent>
                  <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                  <ComboboxList>
                    {(option: ProductOption) => (
                      <ComboboxItem key={option.value} value={option}>
                        {option.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </>
          )}
        </div>

        <DialogFooter className="flex-row justify-end">
          <DialogClose
            render={<Button variant="outline" type="button" className="h-10" />}
          >
            Cancel
          </DialogClose>
          <Button className="h-10" disabled={!selected} onClick={handleCreate}>
            Create row
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
