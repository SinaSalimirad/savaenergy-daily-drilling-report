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
import { type Pump, useDeletePump } from "../api";

export function DeletePumpDialog({
  pump,
  open,
  onOpenChange,
}: {
  pump: Pump;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deletePump = useDeletePump();

  function handleOpenChange(next: boolean) {
    // Keep the dialog open while the request runs, so it cannot be dismissed mid-delete.
    if (!next && deletePump.isPending) return;
    if (!next) deletePump.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete pump</DialogTitle>
          <DialogDescription>
            Delete pump{" "}
            <strong className="text-foreground">{pump.order}</strong> of{" "}
            <strong className="text-foreground">{pump.project_name}</strong>{" "}
            permanently? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deletePump.error && (
          <p className="px-4 text-destructive text-sm">
            {deletePump.error.message}
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
            disabled={deletePump.isPending}
            onClick={() =>
              deletePump.mutate(pump.id, {
                onSuccess: () => {
                  toast.add({ type: "success", title: "Pump deleted" });
                  onOpenChange(false);
                },
              })
            }
          >
            {deletePump.isPending ? "Deleting…" : "Delete pump"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
