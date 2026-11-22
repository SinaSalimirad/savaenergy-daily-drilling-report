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
import { SampleFields } from "../../fluid-samples/components/sample-fields";
import {
  bodyFromValues,
  type FieldDef,
  type FormValues,
  valuesFromRow,
} from "../../fluid-samples/fields";
import { type HydraulicInput, useSetHydraulicInput } from "../api";

export const FLOW_FIELDS: FieldDef[] = [
  { name: "flowrate_gpm", label: "Flowrate", unit: "gpm", kind: "number" },
  { name: "rop_m_hr", label: "ROP", unit: "m/hr", kind: "number" },
];

export const CUTTINGS_FIELDS: FieldDef[] = [
  {
    name: "cuttings_diameter_in",
    label: "Cuttings diameter",
    unit: "in",
    kind: "number",
  },
  {
    name: "cuttings_density_sg",
    label: "Cuttings density",
    unit: "S.G.",
    kind: "number",
  },
];

function InputsForm({
  reportId,
  defs,
  input,
  onSaved,
}: {
  reportId: string;
  defs: FieldDef[];
  input: HydraulicInput;
  onSaved: () => void;
}) {
  const save = useSetHydraulicInput();
  const [values, setValues] = useState<FormValues>(valuesFromRow(defs, input));
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
          toast.add({ type: "success", title: "Inputs saved" });
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

/** Sets the daily inputs of the hydraulics (flowrate, ROP, cuttings) of one report. */
export function HydraulicInputsDialog({
  reportId,
  defs,
  input,
}: {
  reportId: string;
  defs: FieldDef[];
  input: HydraulicInput | undefined;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="h-10 px-4" disabled={!input} />
        }
      >
        <SlidersHorizontalIcon data-icon="inline-start" />
        Inputs
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Daily inputs</DialogTitle>
          <DialogDescription>
            What the calculation needs besides the geometry, the string, the bit
            and the mud.
          </DialogDescription>
        </DialogHeader>
        {/* The dialog unmounts its content when closed, so the form starts from the saved
            values every time it opens. */}
        {input && (
          <InputsForm
            reportId={reportId}
            defs={defs}
            input={input}
            onSaved={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
