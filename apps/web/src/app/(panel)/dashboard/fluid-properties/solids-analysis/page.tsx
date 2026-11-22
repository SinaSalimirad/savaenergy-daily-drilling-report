import { Suspense } from "react";
import { SolidsAnalysisView } from "@/features/solids-analysis/components/solids-analysis-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <SolidsAnalysisView />
    </Suspense>
  );
}
