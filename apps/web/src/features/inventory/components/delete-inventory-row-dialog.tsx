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
import { type InventoryRow, useDeleteInventoryRow } from "../api";

export function DeleteInventoryRowDialog({
  row,
  open,
  onOpenChange,
}: {
  row: InventoryRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const remove = useDeleteInventoryRow();

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
          <DialogTitle>Remove inventory row</DialogTitle>
          <DialogDescription>
            Remove{" "}
            <strong className="text-foreground">{row.product.name}</strong> from
            the inventory of this report? Its movements of this day are deleted.
            The product stays in the project.
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
              remove.mutate(row.id, {
                onSuccess: () => {
                  toast.add({
                    type: "success",
                    title: "Inventory row removed",
                  });
                  onOpenChange(false);
                },
              })
            }
          >
            {remove.isPending ? "Removing…" : "Remove row"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
