"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "../api";
import { ProjectForm } from "./project-form";

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The dialog unmounts its content when closed, so the form starts from the
          project's current values every time it opens. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>
            Change the details of {project.name}.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm project={project} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
