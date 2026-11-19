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
import { useDeleteWell, type Well } from "../api";

export function DeleteWellDialog({
  well,
  open,
  onOpenChange,
}: {
  well: Well;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteWell = useDeleteWell();

  function handleOpenChange(next: boolean) {
    // Keep the dialog open while the request runs, so it cannot be dismissed mid-delete.
    if (!next && deleteWell.isPending) return;
    if (!next) deleteWell.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete well</DialogTitle>
          <DialogDescription>
            Delete <strong className="text-foreground">{well.name}</strong>{" "}
            permanently? This cannot be undone. To keep the data, archive the
            well instead.
          </DialogDescription>
        </DialogHeader>
        {deleteWell.error && (
          <p className="px-4 text-destructive text-sm">
            {deleteWell.error.message}
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
            disabled={deleteWell.isPending}
            onClick={() =>
              deleteWell.mutate(well.id, {
                onSuccess: () => {
                  toast.add({ type: "success", title: "Well deleted" });
                  onOpenChange(false);
                },
              })
            }
          >
            {deleteWell.isPending ? "Deleting…" : "Delete well"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
