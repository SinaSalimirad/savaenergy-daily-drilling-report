"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Sce } from "../api";
import { SceForm } from "./sce-form";

export function EditSceDialog({
  sce,
  open,
  onOpenChange,
}: {
  sce: Sce;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The dialog unmounts its content when closed, so the form starts from the
          the unit's current values every time it opens. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit unit</DialogTitle>
          <DialogDescription>
            Change row {sce.sort_order} of {sce.project_name}.
          </DialogDescription>
        </DialogHeader>
        <SceForm sce={sce} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
