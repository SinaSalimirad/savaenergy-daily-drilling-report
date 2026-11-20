"use client";

import { type FormEvent, useId, useState } from "react";
import type { ProjectProductOrigin } from "schema";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useProducts } from "@/features/products/api";
import { ApiError } from "@/lib/api-error";
import { useAddProjectProduct } from "../api";
import { ORIGIN_OPTIONS } from "../labels";

type ProductOption = { value: string; label: string };

/** Adds a product from the catalog to a project. Products it already uses are not offered. */
export function AddProjectProductForm({
  projectId,
  currency,
  usedProductIds,
}: {
  projectId: string;
  currency: string | undefined;
  usedProductIds: string[];
}) {
  const id = useId();
  const add = useAddProjectProduct();
  // The API allows at most 100 per page; the picker lists the first 100 products by name.
  const catalog = useProducts({ page: 1, pageSize: 100 });
  const [product, setProduct] = useState<ProductOption | null>(null);
  const [origin, setOrigin] = useState<ProjectProductOrigin>("local");
  const [price, setPrice] = useState("");

  const options: ProductOption[] = (catalog.data?.data ?? [])
    .filter((item) => !usedProductIds.includes(item.id))
    .map((item) => ({ value: item.id, label: item.name }));

  // The API says which field is wrong; the rest (a duplicate, say) goes under the form.
  const error = add.error;
  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
  const formError =
    error && Object.keys(fieldErrors).length === 0 ? error.message : undefined;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!product) return;
    add.mutate(
      {
        project_id: projectId,
        product_id: product.value,
        origin,
        price: price === "" ? null : Number(price),
      },
      {
        onSuccess: () => {
          toast.add({ type: "success", title: "Product added" });
          setProduct(null);
          setPrice("");
        },
      },
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 border-t pt-4"
    >
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-product`} className="font-medium text-sm">
            Product
          </label>
          <Combobox
            items={options}
            value={product}
            onValueChange={(option: ProductOption | null) => setProduct(option)}
          >
            <ComboboxInput
              id={`${id}-product`}
              className="h-9 w-full rounded-md bg-transparent shadow-xs"
              placeholder="Search for a product"
              aria-invalid={Boolean(fieldErrors.product_id)}
            />
            <ComboboxContent>
              <ComboboxEmpty>
                {catalog.isPending ? "Loading products…" : "No products found."}
              </ComboboxEmpty>
              <ComboboxList>
                {(option: ProductOption) => (
                  <ComboboxItem key={option.value} value={option}>
                    {option.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {fieldErrors.product_id && (
            <p className="text-destructive text-sm">{fieldErrors.product_id}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-origin`} className="font-medium text-sm">
            Origin
          </label>
          <SimpleSelect
            id={`${id}-origin`}
            options={ORIGIN_OPTIONS}
            value={origin}
            onValueChange={(value) =>
              value && setOrigin(value as ProjectProductOrigin)
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-price`} className="font-medium text-sm">
            Price{currency ? ` (${currency})` : ""}
          </label>
          <Input
            id={`${id}-price`}
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            placeholder="Optional"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            aria-invalid={Boolean(fieldErrors.price)}
          />
          {fieldErrors.price && (
            <p className="text-destructive text-sm">{fieldErrors.price}</p>
          )}
        </div>
      </div>

      {formError && <p className="text-destructive text-sm">{formError}</p>}

      <div className="flex justify-end">
        <Button
          type="submit"
          className="h-10"
          disabled={!product || add.isPending}
        >
          {add.isPending ? "Adding…" : "Add product"}
        </Button>
      </div>
    </form>
  );
}
