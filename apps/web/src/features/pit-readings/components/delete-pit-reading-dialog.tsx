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
import { type PitReading, useDeletePitReading } from "../api";

export function DeletePitReadingDialog({
  reading,
  open,
  onOpenChange,
}: {
  reading: PitReading;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const remove = useDeletePitReading();

  function handleOpenChange(next: boolean) {
    // Keep the dialog open while the request runs, so it cannot be dismissed mid-delete.
    if (!next && remove.isPending) return;
    if (!next) remove.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remove pit reading</DialogTitle>
          <DialogDescription>
            Remove the reading of{" "}
            <strong className="text-foreground">{reading.pit_name}</strong> from
            this report? The pit stays in the project.
          </DialogDescription>
        </DialogHeader>
        {remove.error && (
          <p className="px-4 text-destructive text-sm">
            {remove.error.message}
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
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(reading.id, {
                onSuccess: () => {
                  toast.add({ type: "success", title: "Pit reading removed" });
                  onOpenChange(false);
                },
              })
            }
          >
            {remove.isPending ? "Removing…" : "Remove reading"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
