"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Well } from "../api";
import { WellForm } from "./well-form";

export function EditWellDialog({
  well,
  open,
  onOpenChange,
}: {
  well: Well;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The dialog unmounts its content when closed, so the form starts from the
          well's current values every time it opens. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit well</DialogTitle>
          <DialogDescription>
            Change the details of {well.name}.
          </DialogDescription>
        </DialogHeader>
        <WellForm well={well} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
