"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ProjectFilterSelect } from "@/features/projects/components/project-filter-select";
import { useProjectFilter } from "@/features/projects/project-filter";
import { ReportPicker } from "@/features/reports/components/report-picker";
import { useSelectedReport } from "@/features/reports/use-selected-report";

function Message({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl bg-card p-8 text-center text-muted-foreground">
      {children}
    </div>
  );
}

/**
 * The page of one report's fluid samples: the title, the project and report pickers, and the
 * sheet of the chosen report. `toolbar` and `sheet` receive the id of that report.
 */
export function ReportSheetView({
  title,
  subject,
  toolbar,
  sheet,
}: {
  title: string;
  // What the page shows, for the messages: "mud samples", "rheology readings"...
  subject: string;
  toolbar: (reportId: string) => ReactNode;
  sheet: (reportId: string) => ReactNode;
}) {
  const { projectId } = useProjectFilter();
  const selection = useSelectedReport(projectId);
  const { reports, report, isLoading } = selection;

  let body: ReactNode;
  if (projectId === null) {
    body = <Message>Select a project to see its {subject}.</Message>;
  } else if (reports.isError) {
    body = (
      <Message>
        <span className="text-destructive">{reports.error.message}</span>{" "}
        <Button variant="outline" onClick={() => reports.refetch()}>
          Try again
        </Button>
      </Message>
    );
  } else if (isLoading) {
    body = <Message>Loading reports…</Message>;
  } else if (!report) {
    body = (
      <Message>
        This project has no daily reports yet. Create a report first, then its{" "}
        {subject} appear here.
      </Message>
    );
  } else {
    body = (
      <div className="mt-6 rounded-xl bg-card px-3 py-5">
        {sheet(report.id)}
      </div>
    );
  }

  return (
    <main className="px-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <ProjectFilterSelect appearance="page" />
          {!isLoading && report && toolbar(report.id)}
          <ReportPicker selection={selection} showSection />
        </div>
      </div>
      {body}
    </main>
  );
}
