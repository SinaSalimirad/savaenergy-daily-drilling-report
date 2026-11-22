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
import { usePits } from "@/features/pits/api";
import { useProjectFilter } from "@/features/projects/project-filter";
import { ApiError } from "@/lib/api-error";
import { useCreatePitReading } from "../api";
import {
  EMPTY_FORM_VALUES,
  PitReadingFields,
  type PitReadingFormValues,
  toBody,
} from "./pit-reading-fields";

type PitOption = { value: string; label: string };

// A project has few pits, and the API allows 100 per page.
const PITS_PAGE_SIZE = 100;

/** Adds the reading of one pit to a report. The pit is chosen from the pits of the project. */
export function NewPitReadingDialog({
  reportId,
  existingPitIds,
}: {
  reportId: string;
  // Pits that already have a reading in this report are not offered again.
  existingPitIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PitOption | null>(null);
  const [values, setValues] = useState<PitReadingFormValues>(EMPTY_FORM_VALUES);
  const { projectId } = useProjectFilter();
  const pits = usePits({
    page: 1,
    pageSize: PITS_PAGE_SIZE,
    project_id: projectId ?? undefined,
  });
  const create = useCreatePitReading();

  // The API names the wrong field; any other error (a duplicate, say) goes under the form.
  const fieldErrors =
    create.error instanceof ApiError ? create.error.fieldErrors : {};
  const formError =
    create.error && Object.keys(fieldErrors).length === 0
      ? create.error.message
      : undefined;

  const all = pits.data?.data ?? [];
  const options: PitOption[] = all
    .filter((pit) => !existingPitIds.includes(pit.id))
    .map((pit) => ({ value: pit.id, label: pit.name }));

  function handleOpenChange(next: boolean) {
    if (!next && create.isPending) return;
    setOpen(next);
    if (!next) {
      setSelected(null);
      setValues(EMPTY_FORM_VALUES);
      create.reset();
    }
  }

  function handleCreate() {
    if (!selected) return;
    create.mutate(
      { report_id: reportId, pit_id: selected.value, ...toBody(values) },
      {
        onSuccess: () => {
          toast.add({ type: "success", title: "Pit reading added" });
          handleOpenChange(false);
        },
      },
    );
  }

  let emptyMessage = "All pits of this project already have a reading.";
  if (pits.isPending) emptyMessage = "Loading pits…";
  else if (all.length === 0) {
    emptyMessage = "This project has no pits yet. Add them in Master data.";
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button className="h-10 px-4 font-medium text-card" />}
      >
        <PlusIcon data-icon="inline-start" />
        New reading
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New pit reading</DialogTitle>
          <DialogDescription>
            Choose a pit of the project, and enter what it holds in this report.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 px-4">
          <label htmlFor="pit-reading-pit" className="font-medium text-sm">
            Pit
          </label>
          <Combobox
            items={options}
            value={selected}
            onValueChange={(option: PitOption | null) => setSelected(option)}
          >
            <ComboboxInput
              id="pit-reading-pit"
              className="h-9 w-full rounded-md bg-transparent shadow-xs"
              placeholder="Search for a pit"
            />
            <ComboboxContent>
              <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
              <ComboboxList>
                {(option: PitOption) => (
                  <ComboboxItem key={option.value} value={option}>
                    {option.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

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
          <Button
            className="h-10"
            disabled={!selected || create.isPending}
            onClick={handleCreate}
          >
            {create.isPending ? "Creating…" : "Create reading"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
