import { Suspense } from "react";
import { HoleCleaningView } from "@/features/hole-cleaning/components/hole-cleaning-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <HoleCleaningView />
    </Suspense>
  );
}
