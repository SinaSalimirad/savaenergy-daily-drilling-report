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
import { SceForm } from "./sce-form";

export function NewSceDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="h-10 px-4 font-medium text-card" />}
      >
        <PlusIcon data-icon="inline-start" />
        New unit
      </DialogTrigger>
      {/* The dialog unmounts its content when closed, so the form starts empty every time. */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New unit</DialogTitle>
          <DialogDescription>
            Add a solid control unit to a project, in the order of the rig's
            sheet.
          </DialogDescription>
        </DialogHeader>
        <SceForm onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
