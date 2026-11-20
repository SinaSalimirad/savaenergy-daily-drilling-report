"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Pump } from "../api";
import { PumpForm } from "./pump-form";

export function EditPumpDialog({
  pump,
  open,
  onOpenChange,
}: {
  pump: Pump;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The dialog unmounts its content when closed, so the form starts from the
          the pump's current values every time it opens. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit pump</DialogTitle>
          <DialogDescription>
            Change pump {pump.order} of {pump.project_name}.
          </DialogDescription>
        </DialogHeader>
        <PumpForm pump={pump} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
