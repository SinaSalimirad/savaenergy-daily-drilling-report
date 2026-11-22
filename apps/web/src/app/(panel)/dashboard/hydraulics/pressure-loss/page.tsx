import { Suspense } from "react";
import { PressureLossView } from "@/features/pressure-loss/components/pressure-loss-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <PressureLossView />
    </Suspense>
  );
}
