import { Suspense } from "react";
import { WellboreGeometryView } from "@/features/wellbore-geometry/components/wellbore-geometry-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <WellboreGeometryView />
    </Suspense>
  );
}
