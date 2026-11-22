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
import { type Pit, useDeletePit } from "../api";

export function DeletePitDialog({
  pit,
  open,
  onOpenChange,
}: {
  pit: Pit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deletePit = useDeletePit();

  function handleOpenChange(next: boolean) {
    // Keep the dialog open while the request runs, so it cannot be dismissed mid-delete.
    if (!next && deletePit.isPending) return;
    if (!next) deletePit.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete pit</DialogTitle>
          <DialogDescription>
            Delete pit <strong className="text-foreground">{pit.name}</strong>{" "}
            of <strong className="text-foreground">{pit.project_name}</strong>{" "}
            permanently? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deletePit.error && (
          <p className="px-4 text-destructive text-sm">
            {deletePit.error.message}
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
            disabled={deletePit.isPending}
            onClick={() =>
              deletePit.mutate(pit.id, {
                onSuccess: () => {
                  toast.add({ type: "success", title: "Pit deleted" });
                  onOpenChange(false);
                },
              })
            }
          >
            {deletePit.isPending ? "Deleting…" : "Delete pit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
