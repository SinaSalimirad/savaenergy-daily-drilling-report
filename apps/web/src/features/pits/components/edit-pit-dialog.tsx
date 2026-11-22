"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Pit } from "../api";
import { PitForm } from "./pit-form";

export function EditPitDialog({
  pit,
  open,
  onOpenChange,
}: {
  pit: Pit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The dialog unmounts its content when closed, so the form starts from the
          the pit's current values every time it opens. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit pit</DialogTitle>
          <DialogDescription>
            Change {pit.name} of {pit.project_name}.
          </DialogDescription>
        </DialogHeader>
        <PitForm pit={pit} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
