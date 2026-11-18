import { Button } from "@/components/ui/button";
import { ProjectsTable, type Project } from "@/features/projects/projects-table";
import { ArchiveIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

// TEMPORARY sample data until the projects API endpoint exists.
const dummyProjects: Project[] = [
  {
    id: "1",
    name: "Azadegan Phase 2",
    operator: "NISOC",
    contractor: "Sava Energy",
    field: "Azadegan",
    well: 6,
    active_well: 2,
    last_report: "2026-11-17",
    status: "Active",
  },
  {
    id: "2",
    name: "Yadavaran Infill",
    operator: "NISOC",
    contractor: "Sava Energy",
    field: null,
    well: 3,
    active_well: 0,
    last_report: null,
    status: "Planned",
  },
];

export default function ProjectPage() {
  return <main className="px-16">
  <div className="flex justify-between items-center">

    <h2 className="font-bold text-3xl">Projects</h2>
 
    <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="h-10 border-0 bg-card"
          nativeButton={false}
          render={<Link href="#" />}
        >
          <ArchiveIcon data-icon="inline-start" strokeWidth={1.5} />
          Archive projects
          <span className="inline-flex items-center justify-center rounded-md bg-muted tabular-nums ml-1 px-2.5 py-1 font-medium text-muted-foreground">
            {2}
          </span>
       
        </Button>
        <Button
        className="h-10 px-4 text-card font-medium"
          nativeButton={false}
          render={<Link href="#" />}
        >
          <PlusIcon data-icon="inline-start" />
          New project
        </Button>
      </div>
    </div>


    <div className="mt-6">
      <ProjectsTable data={dummyProjects} />
    </div>
  </main>
}
