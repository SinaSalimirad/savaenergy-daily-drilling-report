"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "../api";
import { ProductForm } from "./product-form";

export function EditProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The dialog unmounts its content when closed, so the form starts from the
          product's current values every time it opens. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>Change {product.name}.</DialogDescription>
        </DialogHeader>
        <ProductForm product={product} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
