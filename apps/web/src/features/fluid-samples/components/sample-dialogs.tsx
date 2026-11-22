"use client";

import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-error";
import {
  bodyFromValues,
  emptyValues,
  type FieldDef,
  type FormValues,
  type SampleBody,
  valuesFromRow,
} from "../fields";
import { SampleFields } from "./sample-fields";

/** The part of a TanStack mutation these dialogs use. */
export type SampleMutation<TVariables> = {
  mutate: (variables: TVariables, options?: { onSuccess?: () => void }) => void;
  isPending: boolean;
  error: Error | null;
  reset: () => void;
};

function errorsOf(error: Error | null) {
  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
  const formError =
    error && Object.keys(fieldErrors).length === 0 ? error.message : undefined;
  return { fieldErrors, formError };
}

/** Adds a sample to a report. `what` is the name in the texts, for example "mud sample". */
export function NewSampleDialog({
  what,
  defs,
  create,
  reportId,
  full,
}: {
  what: string;
  defs: FieldDef[];
  create: SampleMutation<SampleBody>;
  reportId: string;
  // A report has at most 3 samples: with 3 already, the button is off.
  full: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(emptyValues(defs));
  const { fieldErrors, formError } = errorsOf(create.error);

  function handleOpenChange(next: boolean) {
    if (!next && create.isPending) return;
    setOpen(next);
    if (!next) {
      setValues(emptyValues(defs));
      create.reset();
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    create.mutate(
      { report_id: reportId, ...bodyFromValues(defs, values) },
      {
        onSuccess: () => {
          toast.add({ type: "success", title: `${capitalize(what)} added` });
          handleOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            className="h-10 px-4 font-medium text-card"
            disabled={full}
            title={full ? "A report has at most 3 samples." : undefined}
          />
        }
      >
        <PlusIcon data-icon="inline-start" />
        New sample
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New {what}</DialogTitle>
          <DialogDescription>
            Enter what was measured. Leave a field empty when it was not.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
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
              render={
                <Button variant="outline" type="button" className="h-10" />
              }
            >
              Cancel
            </DialogClose>
            <Button type="submit" className="h-10" disabled={create.isPending}>
              {create.isPending ? "Creating…" : `Create ${what}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  what,
  defs,
  row,
  update,
  onSaved,
}: {
  what: string;
  defs: FieldDef[];
  row: Record<string, unknown>;
  update: SampleMutation<SampleBody>;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<FormValues>(valuesFromRow(defs, row));
  const { fieldErrors, formError } = errorsOf(update.error);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    update.mutate(bodyFromValues(defs, values), {
      onSuccess: () => {
        toast.add({ type: "success", title: `${capitalize(what)} updated` });
        onSaved();
      },
    });
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
        <Button type="submit" className="h-10" disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DeleteConfirm({
  what,
  sampleNo,
  remove,
  onRemoved,
  onCancel,
}: {
  what: string;
  sampleNo: number;
  remove: SampleMutation<void>;
  onRemoved: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Remove {what}</DialogTitle>
        <DialogDescription>
          Remove <strong className="text-foreground">sample {sampleNo}</strong>{" "}
          from this report? Its measurements are deleted.
        </DialogDescription>
      </DialogHeader>
      {remove.error && (
        <p className="px-4 text-destructive text-sm">{remove.error.message}</p>
      )}
      <DialogFooter className="flex-row justify-end">
        <Button
          variant="outline"
          type="button"
          className="h-10"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="h-10"
          disabled={remove.isPending}
          onClick={() =>
            remove.mutate(undefined, {
              onSuccess: () => {
                toast.add({
                  type: "success",
                  title: `${capitalize(what)} removed`,
                });
                onRemoved();
              },
            })
          }
        >
          {remove.isPending ? "Removing…" : `Remove ${what}`}
        </Button>
      </DialogFooter>
    </>
  );
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

// The dialogs live outside the menu: the menu content unmounts as soon as an item is clicked,
// and it would take the dialog with it.
type OpenDialog = "edit" | "delete" | null;

/** The "⋯" menu of one sample, with its edit and remove dialogs. */
export function SampleActions({
  what,
  defs,
  row,
  update,
  remove,
}: {
  what: string;
  defs: FieldDef[];
  row: { sample_no: number } & Record<string, unknown>;
  update: SampleMutation<SampleBody>;
  remove: SampleMutation<void>;
}) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const close = () => {
    setOpenDialog(null);
    update.reset();
    remove.reset();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for sample ${row.sample_no}`}
            />
          }
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="flex min-w-44 flex-col gap-1 p-1.5"
        >
          <DropdownMenuItem
            className="px-2 py-2"
            onClick={() => setOpenDialog("edit")}
          >
            <PencilIcon />
            Edit sample
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="px-2 py-2"
            onClick={() => setOpenDialog("delete")}
          >
            <Trash2Icon />
            Remove sample
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={openDialog === "edit"}
        onOpenChange={(open) => (open ? setOpenDialog("edit") : close())}
      >
        {/* The dialog unmounts its content when closed, so the form starts from the sample's
            current values every time it opens. */}
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit {what}</DialogTitle>
            <DialogDescription>
              Change the measurements of sample {row.sample_no}.
            </DialogDescription>
          </DialogHeader>
          <EditForm
            what={what}
            defs={defs}
            row={row}
            update={update}
            onSaved={close}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDialog === "delete"}
        onOpenChange={(open) => {
          // Keep the dialog open while the request runs, so it cannot be dismissed mid-delete.
          if (!open && remove.isPending) return;
          if (open) setOpenDialog("delete");
          else close();
        }}
      >
        <DialogContent className="max-w-md">
          <DeleteConfirm
            what={what}
            sampleNo={row.sample_no}
            remove={remove}
            onRemoved={close}
            onCancel={close}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
