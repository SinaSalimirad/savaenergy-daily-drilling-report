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
import { toast } from "@/components/ui/toast";
import { useProjectProducts } from "@/features/project-products/api";
import { useProjectFilter } from "@/features/projects/project-filter";
import { useCreateInventoryRow } from "../api";

type ProductOption = { value: string; label: string };

/**
 * Adds a row to the inventory of one report. The product is chosen from the products of the
 * project ("Products of project"). Its initial stock continues from the previous report.
 */
export function NewInventoryRowDialog({
  reportId,
  existingProjectProductIds,
}: {
  reportId: string;
  // Products that already have a row in this report are not offered again.
  existingProjectProductIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ProductOption | null>(null);
  const { projectId } = useProjectFilter();
  const projectProducts = useProjectProducts(projectId);
  const create = useCreateInventoryRow();

  const all = projectProducts.data?.data ?? [];
  const options: ProductOption[] = all
    .filter((item) => !existingProjectProductIds.includes(item.id))
    .map((item) => ({ value: item.id, label: item.product.name }));

  function handleOpenChange(next: boolean) {
    if (!next && create.isPending) return;
    setOpen(next);
    if (!next) {
      setSelected(null);
      create.reset();
    }
  }

  function handleCreate() {
    if (!selected) return;
    create.mutate(
      { report_id: reportId, project_product_id: selected.value },
      {
        onSuccess: () => {
          toast.add({ type: "success", title: "Inventory row added" });
          handleOpenChange(false);
        },
      },
    );
  }

  let emptyMessage = "All products of this project are already in this report.";
  if (projectProducts.isPending) emptyMessage = "Loading products…";
  else if (all.length === 0) {
    emptyMessage =
      "This project has no products yet. Add them in “Products of project”.";
  }

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
          {create.error && (
            <p className="text-destructive text-sm">{create.error.message}</p>
          )}
        </div>

        <DialogFooter className="flex-row justify-end">
          <DialogClose
            render={<Button variant="outline" type="button" className="h-10" />}
          >
            Cancel
          </DialogClose>
          <Button
            className="h-10"
            disabled={!selected || create.isPending}
            onClick={handleCreate}
          >
            {create.isPending ? "Creating…" : "Create row"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
