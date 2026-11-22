"use client";

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
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-error";
import { type PitReading, useUpdatePitReading } from "../api";
import {
  PitReadingFields,
  type PitReadingFormValues,
  toBody,
} from "./pit-reading-fields";

function EditForm({
  reading,
  onSaved,
}: {
  reading: PitReading;
  onSaved: () => void;
}) {
  const update = useUpdatePitReading();
  const [values, setValues] = useState<PitReadingFormValues>({
    volume: String(reading.volume),
    mud_weight: reading.mud_weight === null ? "" : String(reading.mud_weight),
    mud_type: reading.mud_type ?? "",
  });

  const error = update.error;
  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
  const formError =
    error && Object.keys(fieldErrors).length === 0 ? error.message : undefined;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    update.mutate(
      { id: reading.id, body: toBody(values) },
      {
        onSuccess: () => {
          toast.add({ type: "success", title: "Pit reading updated" });
          onSaved();
        },
      },
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PitReadingFields
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
        <Button type="submit" className="h-10" disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditPitReadingDialog({
  reading,
  open,
  onOpenChange,
}: {
  reading: PitReading;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The dialog unmounts its content when closed, so the form starts from the reading's
          current values every time it opens. */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit pit reading</DialogTitle>
          <DialogDescription>
            Change what {reading.pit_name} holds in this report.
          </DialogDescription>
        </DialogHeader>
        <EditForm reading={reading} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
