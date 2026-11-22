import { Suspense } from "react";
import { MudSamplesView } from "@/features/mud-samples/components/mud-samples-view";

export default function Page() {
  // The view reads `?report=` from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <MudSamplesView />
    </Suspense>
  );
}
