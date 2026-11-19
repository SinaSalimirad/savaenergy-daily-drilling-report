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
import { SectionForm } from "./section-form";

export function NewSectionDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="h-10 px-4 font-medium text-card" />}
      >
        <PlusIcon data-icon="inline-start" />
        New section
      </DialogTrigger>
      {/* The dialog unmounts its content when closed, so the form starts empty every time. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New section</DialogTitle>
          <DialogDescription>
            Add a hole section to a well, in the order it is drilled.
          </DialogDescription>
        </DialogHeader>
        <SectionForm onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
