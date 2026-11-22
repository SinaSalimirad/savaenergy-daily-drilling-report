import { Suspense } from "react";
import { SurveyView } from "@/features/survey/components/survey-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <SurveyView />
    </Suspense>
  );
}
