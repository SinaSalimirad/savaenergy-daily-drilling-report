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
import { type Section, useDeleteSection } from "../api";

export function DeleteSectionDialog({
  section,
  open,
  onOpenChange,
}: {
  section: Section;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteSection = useDeleteSection();

  function handleOpenChange(next: boolean) {
    // Keep the dialog open while the request runs, so it cannot be dismissed mid-delete.
    if (!next && deleteSection.isPending) return;
    if (!next) deleteSection.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete section</DialogTitle>
          <DialogDescription>
            Delete section{" "}
            <strong className="text-foreground">{section.order}</strong> of{" "}
            <strong className="text-foreground">{section.well_name}</strong>{" "}
            permanently? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deleteSection.error && (
          <p className="px-4 text-destructive text-sm">
            {deleteSection.error.message}
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
            disabled={deleteSection.isPending}
            onClick={() =>
              deleteSection.mutate(section.id, {
                onSuccess: () => {
                  toast.add({ type: "success", title: "Section deleted" });
                  onOpenChange(false);
                },
              })
            }
          >
            {deleteSection.isPending ? "Deleting…" : "Delete section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
