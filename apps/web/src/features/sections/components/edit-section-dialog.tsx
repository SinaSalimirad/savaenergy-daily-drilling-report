"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Section } from "../api";
import { SectionForm } from "./section-form";

export function EditSectionDialog({
  section,
  open,
  onOpenChange,
}: {
  section: Section;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The dialog unmounts its content when closed, so the form starts from the
          section's current values every time it opens. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit section</DialogTitle>
          <DialogDescription>
            Change section {section.sort_order} of {section.well_name}.
          </DialogDescription>
        </DialogHeader>
        <SectionForm section={section} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
