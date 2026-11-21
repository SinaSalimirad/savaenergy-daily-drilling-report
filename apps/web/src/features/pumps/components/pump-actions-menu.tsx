"use client";

import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Pump } from "../api";
import { DeletePumpDialog } from "./delete-pump-dialog";
import { EditPumpDialog } from "./edit-pump-dialog";

// Edit and Delete open a dialog, which lives outside the menu: the menu content unmounts as
// soon as an item is clicked, and it would take the dialog with it. Pumps have no archive.
type OpenDialog = "edit" | "delete" | null;

export function PumpActionsMenu({ pump }: { pump: Pump }) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for pump ${pump.sort_order} of ${pump.project_name}`}
            />
          }
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="flex min-w-52 flex-col gap-1 p-1.5"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Pump actions</DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuItem
            className="px-2 py-2"
            onClick={() => setOpenDialog("edit")}
          >
            <PencilIcon />
            Edit pump
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="px-2 py-2"
            onClick={() => setOpenDialog("delete")}
          >
            <Trash2Icon />
            Delete pump
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditPumpDialog
        pump={pump}
        open={openDialog === "edit"}
        onOpenChange={(open) => setOpenDialog(open ? "edit" : null)}
      />
      <DeletePumpDialog
        pump={pump}
        open={openDialog === "delete"}
        onOpenChange={(open) => setOpenDialog(open ? "delete" : null)}
      />
    </>
  );
}
