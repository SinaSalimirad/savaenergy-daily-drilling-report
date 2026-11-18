"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectsList } from "./projects-list";

export function ArchivedProjectsView() {
  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Archived projects</h2>

        <Button
          variant="outline"
          className="h-10 border-0 bg-card"
          nativeButton={false}
          render={<Link href="/dashboard/master-data/projects" />}
        >
          <ArrowLeftIcon data-icon="inline-start" strokeWidth={1.5} />
          Back to projects
        </Button>
      </div>

      <ProjectsList archived emptyMessage="No archived projects." />
    </main>
  );
}
