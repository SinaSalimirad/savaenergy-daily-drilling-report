import { Suspense } from "react";
import { WellRecapView } from "@/features/recap/components/well-recap-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <WellRecapView />
    </Suspense>
  );
}
