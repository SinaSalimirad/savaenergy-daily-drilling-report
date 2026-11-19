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
import { type Product, useDeleteProduct } from "../api";

export function DeleteProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteProduct = useDeleteProduct();

  function handleOpenChange(next: boolean) {
    // Keep the dialog open while the request runs, so it cannot be dismissed mid-delete.
    if (!next && deleteProduct.isPending) return;
    if (!next) deleteProduct.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            Delete <strong className="text-foreground">{product.name}</strong>{" "}
            permanently? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deleteProduct.error && (
          <p className="px-4 text-destructive text-sm">
            {deleteProduct.error.message}
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
            disabled={deleteProduct.isPending}
            onClick={() =>
              deleteProduct.mutate(product.id, {
                onSuccess: () => {
                  toast.add({ type: "success", title: "Product deleted" });
                  onOpenChange(false);
                },
              })
            }
          >
            {deleteProduct.isPending ? "Deleting…" : "Delete product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
