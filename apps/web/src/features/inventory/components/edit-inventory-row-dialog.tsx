"use client";

import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-error";
import { type InventoryRow, useUpdateInventoryRow } from "../api";

const FIELDS = [
  { name: "initial", label: "Initial stock" },
  { name: "received", label: "Received" },
  { name: "used", label: "Used" },
  { name: "returned", label: "Returned" },
] as const;

type FieldName = (typeof FIELDS)[number]["name"];

function EditForm({
  row,
  onSaved,
}: {
  row: InventoryRow;
  onSaved: () => void;
}) {
  const id = useId();
  const update = useUpdateInventoryRow();
  // Numbers are kept as text while typing and converted on submit.
  const [values, setValues] = useState<Record<FieldName, string>>({
    initial: String(row.initial_stock),
    received: String(row.daily_received),
    used: String(row.daily_used),
    returned: String(row.daily_returned),
  });

  const error = update.error;
  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
  const formError =
    error && Object.keys(fieldErrors).length === 0 ? error.message : undefined;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    // An empty field becomes NaN, which JSON sends as null: the API answers with its message.
    const toNumber = (text: string) =>
      text === "" ? Number.NaN : Number(text);
    update.mutate(
      {
        id: row.id,
        body: {
          initial: toNumber(values.initial),
          received: toNumber(values.received),
          used: toNumber(values.used),
          returned: toNumber(values.returned),
        },
      },
      {
        onSuccess: () => {
          toast.add({ type: "success", title: "Inventory row updated" });
          onSaved();
        },
      },
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 px-4 sm:grid-cols-2">
        {FIELDS.map(({ name, label }) => (
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
              value={values[name]}
              onChange={(event) =>
                setValues((current) => ({
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
          <p className="text-destructive text-sm sm:col-span-2">{formError}</p>
        )}
      </div>
      <DialogFooter className="flex-row justify-end">
        <DialogClose
          render={<Button variant="outline" type="button" className="h-10" />}
        >
          Cancel
        </DialogClose>
        <Button type="submit" className="h-10" disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditInventoryRowDialog({
  row,
  open,
  onOpenChange,
}: {
  row: InventoryRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The dialog unmounts its content when closed, so the form starts from the row's
          current values every time it opens. */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit inventory row</DialogTitle>
          <DialogDescription>
            Change the movements of {row.product.name} for this report.
          </DialogDescription>
        </DialogHeader>
        <EditForm row={row} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
