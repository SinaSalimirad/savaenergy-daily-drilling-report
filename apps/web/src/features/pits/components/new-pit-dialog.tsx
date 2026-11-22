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
import { PitForm } from "./pit-form";

export function NewPitDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="h-10 px-4 font-medium text-card" />}
      >
        <PlusIcon data-icon="inline-start" />
        New pit
      </DialogTrigger>
      {/* The dialog unmounts its content when closed, so the form starts empty every time. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New pit</DialogTitle>
          <DialogDescription>
            Add a mud pit to a project, with its type and capacity.
          </DialogDescription>
        </DialogHeader>
        <PitForm onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
