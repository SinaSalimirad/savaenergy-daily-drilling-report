"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WellsList } from "./wells-list";

export function ArchivedWellsView() {
  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Archived wells</h2>

        <Button
          variant="outline"
          className="h-10 border-0 bg-card"
          nativeButton={false}
          render={<Link href="/dashboard/master-data/wells" />}
        >
          <ArrowLeftIcon data-icon="inline-start" strokeWidth={1.5} />
          Back to wells
        </Button>
      </div>

      <WellsList archived emptyMessage="No archived wells." />
    </main>
  );
}
