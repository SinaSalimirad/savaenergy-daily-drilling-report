"use client";

import { NewProductDialog } from "./new-product-dialog";
import { ProductsList } from "./products-list";

export function ProductsView() {
  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Products</h2>
        <NewProductDialog />
      </div>

      <ProductsList />
    </main>
  );
}
