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
import { type Sce, useDeleteSce } from "../api";

export function DeleteSceDialog({
  sce,
  open,
  onOpenChange,
}: {
  sce: Sce;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteSce = useDeleteSce();

  function handleOpenChange(next: boolean) {
    // Keep the dialog open while the request runs, so it cannot be dismissed mid-delete.
    if (!next && deleteSce.isPending) return;
    if (!next) deleteSce.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete unit</DialogTitle>
          <DialogDescription>
            Delete unit <strong className="text-foreground">{sce.order}</strong>{" "}
            of <strong className="text-foreground">{sce.project_name}</strong>{" "}
            permanently? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deleteSce.error && (
          <p className="px-4 text-destructive text-sm">
            {deleteSce.error.message}
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
            disabled={deleteSce.isPending}
            onClick={() =>
              deleteSce.mutate(sce.id, {
                onSuccess: () => {
                  toast.add({ type: "success", title: "Unit deleted" });
                  onOpenChange(false);
                },
              })
            }
          >
            {deleteSce.isPending ? "Deleting…" : "Delete unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
