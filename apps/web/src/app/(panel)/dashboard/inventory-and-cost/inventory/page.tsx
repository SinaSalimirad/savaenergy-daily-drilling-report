import { Suspense } from "react";
import { InventoryView } from "@/features/inventory/components/inventory-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <InventoryView />
    </Suspense>
  );
}
