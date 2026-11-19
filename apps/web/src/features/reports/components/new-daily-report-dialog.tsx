"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DailyReportForm } from "./daily-report-form";

export function NewDailyReportDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="h-10 px-4 font-medium text-card" />}
      >
        <PlusIcon data-icon="inline-start" />
        New report
      </DialogTrigger>
      {/* The dialog unmounts its content when closed, so the form starts empty every time. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New daily report</DialogTitle>
          <DialogDescription>
            Add the report of one day for a well, in the section being drilled.
          </DialogDescription>
        </DialogHeader>
        <DailyReportForm onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
