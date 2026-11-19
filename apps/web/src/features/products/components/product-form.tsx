"use client";

import { useForm } from "@tanstack/react-form";
import { type ReactNode, useId } from "react";
import type { ProductKind, ProductPackageUnit } from "schema";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-error";
import {
  type Product,
  type ProductBody,
  useCreateProduct,
  useUpdateProduct,
} from "../api";
import { KIND_OPTIONS, PACKAGE_UNIT_OPTIONS } from "../labels";

// Numbers are kept as text while typing and converted on submit.
const emptyValues = {
  name: "",
  kind: "bulk" as ProductKind,
  package_size: "",
  package_unit: "" as ProductPackageUnit | "",
  specific_gravity: "",
  length_m: "",
  width_m: "",
};

const numberText = (value: number | null) =>
  value === null ? "" : String(value);

function valuesFrom(product: Product): typeof emptyValues {
  return {
    name: product.name,
    kind: product.kind,
    package_size: numberText(product.package_size),
    package_unit: product.package_unit ?? "",
    specific_gravity: numberText(product.specific_gravity),
    length_m: numberText(product.length_m),
    width_m: numberText(product.width_m),
  };
}

// An empty field becomes NaN, which JSON sends as null: the API answers with its message,
// for example "Enter a number for Length, for example 25."
const toNumber = (text: string) => (text === "" ? Number.NaN : Number(text));

/** Only the fields of the chosen kind are sent: the others do not apply to it. */
function toBody(value: typeof emptyValues): ProductBody {
  const name = value.name;
  switch (value.kind) {
    case "bulk":
      return {
        kind: "bulk",
        name,
        package_size: toNumber(value.package_size),
        // An empty unit is not a valid value: the API answers "Choose a unit."
        package_unit: value.package_unit as ProductPackageUnit,
        specific_gravity: toNumber(value.specific_gravity),
      };
    case "dimensional":
      return {
        kind: "dimensional",
        name,
        length_m: toNumber(value.length_m),
        width_m: toNumber(value.width_m),
      };
    case "equipment":
      return { kind: "equipment", name };
  }
}

type FieldProps = {
  label: string;
  error?: string;
  children: (props: { id: string; invalid: boolean }) => ReactNode;
};

function Field({ label, error, children }: FieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-medium text-sm">
        {label}
      </label>
      {children({ id, invalid: Boolean(error) })}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

/** What the API said went wrong: a message for the form and messages for single fields. */
function toServerErrors(error: unknown) {
  if (!(error instanceof ApiError)) {
    return { form: "Something went wrong.", fields: {} };
  }
  const hasFieldErrors = Object.keys(error.fieldErrors).length > 0;
  return {
    form: hasFieldErrors ? undefined : error.message,
    fields: error.fieldErrors,
  };
}

// Errors come from the API (see `onSubmitAsync`), so they are plain strings.
const firstError = (errors: unknown[]) =>
  errors.find((error): error is string => typeof error === "string");

type NumberFieldName =
  | "package_size"
  | "specific_gravity"
  | "length_m"
  | "width_m";

/** A decimal number, typed as text and converted on submit. */
function NumberField({
  form,
  name,
  label,
  placeholder,
}: {
  form: ReturnType<typeof useProductForm>;
  name: NumberFieldName;
  label: string;
  placeholder: string;
}) {
  return (
    <form.Field name={name}>
      {(field) => (
        <Field label={label} error={firstError(field.state.meta.errors)}>
          {({ id, invalid }) => (
            <Input
              id={id}
              name={field.name}
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder={placeholder}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={invalid}
            />
          )}
        </Field>
      )}
    </form.Field>
  );
}

function useProductForm(product: Product | undefined, onSaved: () => void) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  return useForm({
    defaultValues: product ? valuesFrom(product) : emptyValues,
    validators: {
      // Server-side validation: the API is the only place the rules live.
      onSubmitAsync: async ({ value }) => {
        const body = toBody(value);
        try {
          if (product) {
            await updateProduct.mutateAsync({ id: product.id, body });
          } else {
            await createProduct.mutateAsync(body);
          }
        } catch (error) {
          return toServerErrors(error);
        }
        toast.add({
          type: "success",
          title: product ? "Product updated" : "Product created",
        });
        onSaved();
        return undefined;
      },
    },
  });
}

/** Creates a product, or edits `product` when one is given. */
export function ProductForm({
  product,
  onSaved,
}: {
  product?: Product;
  onSaved: () => void;
}) {
  const form = useProductForm(product, onSaved);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
    >
      <div className="grid gap-4 px-4 sm:grid-cols-2">
        <form.Field name="name">
          {(field) => (
            <Field label="Name" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  name={field.name}
                  placeholder="e.g. Barite"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={invalid}
                />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="kind">
          {(field) => (
            <Field label="Kind" error={firstError(field.state.meta.errors)}>
              {({ id, invalid }) => (
                <SimpleSelect
                  id={id}
                  invalid={invalid}
                  options={KIND_OPTIONS}
                  placeholder="Select a kind"
                  value={field.state.value}
                  onValueChange={(value) =>
                    value && field.handleChange(value as ProductKind)
                  }
                />
              )}
            </Field>
          )}
        </form.Field>

        {/* The kind decides which fields apply, as in the database. */}
        <form.Subscribe selector={(state) => state.values.kind}>
          {(kind) => (
            <>
              {kind === "bulk" && (
                <>
                  <NumberField
                    form={form}
                    name="package_size"
                    label="Package size"
                    placeholder="e.g. 25"
                  />
                  <form.Field name="package_unit">
                    {(field) => (
                      <Field
                        label="Package unit"
                        error={firstError(field.state.meta.errors)}
                      >
                        {({ id, invalid }) => (
                          <SimpleSelect
                            id={id}
                            invalid={invalid}
                            options={PACKAGE_UNIT_OPTIONS}
                            placeholder="Select a unit"
                            value={field.state.value || null}
                            onValueChange={(value) =>
                              value &&
                              field.handleChange(value as ProductPackageUnit)
                            }
                          />
                        )}
                      </Field>
                    )}
                  </form.Field>
                  <NumberField
                    form={form}
                    name="specific_gravity"
                    label="Specific gravity"
                    placeholder="e.g. 4.2"
                  />
                </>
              )}
              {kind === "dimensional" && (
                <>
                  <NumberField
                    form={form}
                    name="length_m"
                    label="Length (m)"
                    placeholder="e.g. 6"
                  />
                  <NumberField
                    form={form}
                    name="width_m"
                    label="Width (m)"
                    placeholder="e.g. 4"
                  />
                </>
              )}
            </>
          )}
        </form.Subscribe>

        <form.Subscribe selector={(state) => firstError(state.errors)}>
          {(formError) =>
            formError && (
              <p className="text-destructive text-sm sm:col-span-2">
                {formError}
              </p>
            )
          }
        </form.Subscribe>
      </div>

      <DialogFooter className="flex-row justify-end">
        <DialogClose
          render={<Button variant="outline" type="button" className="h-10" />}
        >
          Cancel
        </DialogClose>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" className="h-10" disabled={isSubmitting}>
              {isSubmitting
                ? product
                  ? "Saving…"
                  : "Creating…"
                : product
                  ? "Save changes"
                  : "Create product"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}
