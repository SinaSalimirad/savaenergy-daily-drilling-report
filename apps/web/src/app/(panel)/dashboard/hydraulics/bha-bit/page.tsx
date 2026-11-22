import { Suspense } from "react";
import { BhaBitView } from "@/features/bha-bit/components/bha-bit-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <BhaBitView />
    </Suspense>
  );
}
