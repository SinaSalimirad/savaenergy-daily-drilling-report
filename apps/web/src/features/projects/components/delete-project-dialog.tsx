"use client";

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
import { type Project, useDeleteProject } from "../api";

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteProject = useDeleteProject();

  function handleOpenChange(next: boolean) {
    // Keep the dialog open while the request runs, so it cannot be dismissed mid-delete.
    if (!next && deleteProject.isPending) return;
    if (!next) deleteProject.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            Delete <strong className="text-foreground">{project.name}</strong>{" "}
            permanently? This cannot be undone. To keep the data, archive the
            project instead.
          </DialogDescription>
        </DialogHeader>
        {deleteProject.error && (
          <p className="px-4 text-destructive text-sm">
            {deleteProject.error.message}
          </p>
        )}
        <DialogFooter className="flex-row justify-end">
          <DialogClose
            render={<Button variant="outline" type="button" className="h-10" />}
          >
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            className="h-10"
            disabled={deleteProject.isPending}
            onClick={() =>
              deleteProject.mutate(project.id, {
                onSuccess: () => {
                  toast.add({ type: "success", title: "Project deleted" });
                  onOpenChange(false);
                },
              })
            }
          >
            {deleteProject.isPending ? "Deleting…" : "Delete project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
