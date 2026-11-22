import { Suspense } from "react";
import { RheologyReadingsView } from "@/features/rheology/components/rheology-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <RheologyReadingsView />
    </Suspense>
  );
}
