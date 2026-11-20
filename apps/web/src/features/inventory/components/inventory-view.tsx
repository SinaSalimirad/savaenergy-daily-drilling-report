"use client";

import { useState } from "react";
import { ProjectProductsDialog } from "@/features/project-products/components/project-products-dialog";
import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { SAMPLE_INVENTORY_ROWS } from "../sample-data";
import type { InventoryRow } from "../types";
import { InventoryTable } from "./inventory-table";
import { NewInventoryRowDialog } from "./new-inventory-row-dialog";

export function InventoryView() {
  // TEMPORARY: sample data, and rows added with "New row" live only in this page's state. Replace
  // both with a query hook and a mutation (features/inventory/api.ts) once the API exists; then
  // this component also needs loading and error states like the other lists.
  const [addedRows, setAddedRows] = useState<InventoryRow[]>([]);
  const rows = [...SAMPLE_INVENTORY_ROWS, ...addedRows];

  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Inventory</h2>

        <div className="flex items-center gap-2">
          <ProjectFilterSelect appearance="page" />
          <ProjectProductsDialog />
          <NewInventoryRowDialog
            existingNames={rows.map((row) => row.name)}
            onCreate={(row) => setAddedRows((current) => [...current, row])}
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-card px-3 py-5">
        <InventoryTable
          rows={rows}
          emptyMessage="No products in this project yet."
        />
      </div>
    </main>
  );
}
