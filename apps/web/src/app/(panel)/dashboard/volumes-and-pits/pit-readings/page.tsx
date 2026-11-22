import { Suspense } from "react";
import { PitReadingsView } from "@/features/pit-readings/components/pit-readings-view";

export default function PitReadingsPage() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <PitReadingsView />
    </Suspense>
  );
}
