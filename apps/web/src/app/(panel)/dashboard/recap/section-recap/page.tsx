import { Suspense } from "react";
import { SectionRecapView } from "@/features/recap/components/section-recap-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <SectionRecapView />
    </Suspense>
  );
}
