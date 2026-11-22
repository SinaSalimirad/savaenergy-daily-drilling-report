"use client";

import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PitReading } from "../api";
import { DeletePitReadingDialog } from "./delete-pit-reading-dialog";
import { EditPitReadingDialog } from "./edit-pit-reading-dialog";

// The dialogs live outside the menu: the menu content unmounts as soon as an item is clicked,
// and it would take the dialog with it.
type OpenDialog = "edit" | "delete" | null;

export function PitReadingActions({ reading }: { reading: PitReading }) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${reading.pit_name}`}
            />
          }
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="flex min-w-44 flex-col gap-1 p-1.5"
        >
          <DropdownMenuItem
            className="px-2 py-2"
            onClick={() => setOpenDialog("edit")}
          >
            <PencilIcon />
            Edit reading
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="px-2 py-2"
            onClick={() => setOpenDialog("delete")}
          >
            <Trash2Icon />
            Remove reading
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditPitReadingDialog
        reading={reading}
        open={openDialog === "edit"}
        onOpenChange={(open) => setOpenDialog(open ? "edit" : null)}
      />
      <DeletePitReadingDialog
        reading={reading}
        open={openDialog === "delete"}
        onOpenChange={(open) => setOpenDialog(open ? "delete" : null)}
      />
    </>
  );
}
