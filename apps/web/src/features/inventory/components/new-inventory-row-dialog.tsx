"use client";

import { PlusIcon } from "lucide-react";
import { useId, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useProjectProducts } from "@/features/project-products/api";
import { useProjectFilter } from "@/features/projects/project-filter";
import { ApiError } from "@/lib/api-error";
import { useCreateInventoryRow } from "../api";

type ProductOption = { value: string; label: string };

// Whole numbers, kept as text while typing. An empty field is left out of the request:
// the initial stock then continues from the previous report, the others start at 0.
const FIELDS = [
  {
    name: "initial",
    label: "Initial stock",
    placeholder: "From the previous report",
  },
  { name: "received", label: "Received", placeholder: "0" },
  { name: "used", label: "Used", placeholder: "0" },
  { name: "returned", label: "Returned", placeholder: "0" },
] as const;
type FieldName = (typeof FIELDS)[number]["name"];
const EMPTY_NUMBERS: Record<FieldName, string> = {
  initial: "",
  received: "",
  used: "",
  returned: "",
};

/**
 * Adds a row to the inventory of one report. The product is chosen from the products of the
 * project ("Manage products"). Its initial stock continues from the previous report.
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
  const [numbers, setNumbers] = useState(EMPTY_NUMBERS);
  const id = useId();
  const { projectId } = useProjectFilter();
  const projectProducts = useProjectProducts(projectId);
  const create = useCreateInventoryRow();

  // The API names the wrong field; any other error (a duplicate, say) goes under the form.
  const fieldErrors =
    create.error instanceof ApiError ? create.error.fieldErrors : {};
  const formError =
    create.error && Object.keys(fieldErrors).length === 0
      ? create.error.message
      : undefined;

  const all = projectProducts.data?.data ?? [];
  const options: ProductOption[] = all
    .filter((item) => !existingProjectProductIds.includes(item.id))
    .map((item) => ({ value: item.id, label: item.product.name }));

  function handleOpenChange(next: boolean) {
    if (!next && create.isPending) return;
    setOpen(next);
    if (!next) {
      setSelected(null);
      setNumbers(EMPTY_NUMBERS);
      create.reset();
    }
  }

  function handleCreate() {
    if (!selected) return;
    create.mutate(
      {
        report_id: reportId,
        project_product_id: selected.value,
        ...Object.fromEntries(
          FIELDS.filter(({ name }) => numbers[name] !== "").map(({ name }) => [
            name,
            Number(numbers[name]),
          ]),
        ),
      },
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
      "This project has no products yet. Add them with “Manage products”.";
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button className="h-10 px-4 font-medium text-card" />}
      >
        <PlusIcon data-icon="inline-start" />
        New row
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New row</DialogTitle>
          <DialogDescription>
            Choose a product from the products of the project, and enter its
            stock and movements for this report.
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
        </div>

        <div className="grid gap-4 px-4 sm:grid-cols-2">
          {FIELDS.map(({ name, label, placeholder }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-${name}`} className="font-medium text-sm">
                {label}
              </label>
              <Input
                id={`${id}-${name}`}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                placeholder={placeholder}
                value={numbers[name]}
                onChange={(event) =>
                  setNumbers((current) => ({
                    ...current,
                    [name]: event.target.value,
                  }))
                }
                aria-invalid={Boolean(fieldErrors[name])}
              />
              {fieldErrors[name] && (
                <p className="text-destructive text-sm">{fieldErrors[name]}</p>
              )}
            </div>
          ))}
          {formError && (
            <p className="text-destructive text-sm sm:col-span-2">
              {formError}
            </p>
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
