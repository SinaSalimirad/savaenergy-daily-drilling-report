import { Suspense } from "react";
import { LossesView } from "@/features/volumes/components/losses-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <LossesView />
    </Suspense>
  );
}
