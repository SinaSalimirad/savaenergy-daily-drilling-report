"use client";

import { SAMPLE_INVENTORY_ROWS } from "../sample-data";
import { InventoryTable } from "./inventory-table";

export function InventoryView() {
  // TEMPORARY: sample data. Replace with a query hook (features/inventory/api.ts) once the API
  // exists; then this component also needs loading and error states like the other lists.
  return (
    <main className="px-16">
      <h2 className="text-3xl font-bold">Inventory</h2>

      <div className="mt-6 rounded-xl bg-card px-3 py-5">
        <InventoryTable
          rows={SAMPLE_INVENTORY_ROWS}
          emptyMessage="No products in this project yet."
        />
      </div>
    </main>
  );
}
