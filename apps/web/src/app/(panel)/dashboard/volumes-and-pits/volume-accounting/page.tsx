import { Suspense } from "react";
import { VolumeAccountingView } from "@/features/volumes/components/volume-accounting-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <VolumeAccountingView />
    </Suspense>
  );
}
