"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { ApiError } from "@/lib/api-error";
import {
  bodyFromValues,
  type FieldDef,
  type FormValues,
  valuesFromRow,
} from "../fields";
import type { SampleMutation } from "./sample-dialogs";
import { SampleFields } from "./sample-fields";

type SaveBody = Record<string, unknown>;

function ValuesForm({
  reportId,
  defs,
  values: saved,
  save,
  onSaved,
}: {
  reportId: string;
  defs: FieldDef[];
  values: Record<string, unknown>;
  save: SampleMutation<SaveBody>;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<FormValues>(valuesFromRow(defs, saved));
  const fieldErrors =
    save.error instanceof ApiError ? save.error.fieldErrors : {};
  const formError =
    save.error && Object.keys(fieldErrors).length === 0
      ? save.error.message
      : undefined;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate(
      { report_id: reportId, ...bodyFromValues(defs, values) },
      {
        onSuccess: () => {
          toast.add({ type: "success", title: "Saved" });
          onSaved();
        },
      },
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SampleFields
        defs={defs}
        values={values}
        onChange={setValues}
        fieldErrors={fieldErrors}
      />
      {formError && (
        <p className="px-4 text-destructive text-sm">{formError}</p>
      )}
      <DialogFooter className="flex-row justify-end">
        <DialogClose
          render={<Button variant="outline" type="button" className="h-10" />}
        >
          Cancel
        </DialogClose>
        <Button type="submit" className="h-10" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Edits the one set of values that a daily report has (it is saved over the old one, never
 * added). `values` is `undefined` until the saved values are loaded.
 */
export function ReportValuesDialog({
  title,
  description,
  triggerLabel,
  reportId,
  defs,
  values,
  save,
}: {
  title: string;
  description: string;
  triggerLabel: string;
  reportId: string;
  defs: FieldDef[];
  values: Record<string, unknown> | undefined;
  save: SampleMutation<SaveBody>;
}) {
  const [open, setOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next && save.isPending) return;
    setOpen(next);
    if (!next) save.reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" className="h-10 px-4" disabled={!values} />
        }
      >
        <SlidersHorizontalIcon data-icon="inline-start" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {/* The dialog unmounts its content when closed, so the form starts from the saved
            values every time it opens. */}
        {values && (
          <ValuesForm
            reportId={reportId}
            defs={defs}
            values={values}
            save={save}
            onSaved={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
