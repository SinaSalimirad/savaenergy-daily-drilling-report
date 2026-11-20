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
import type { Sce } from "../api";
import { DeleteSceDialog } from "./delete-sce-dialog";
import { EditSceDialog } from "./edit-sce-dialog";

// Edit and Delete open a dialog, which lives outside the menu: the menu content unmounts as
// soon as an item is clicked, and it would take the dialog with it. Nothing references a unit yet, so there is no archive.
type OpenDialog = "edit" | "delete" | null;

export function SceActionsMenu({ sce }: { sce: Sce }) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for row ${sce.order} of ${sce.project_name}`}
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
            <DropdownMenuLabel>Solid control actions</DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuItem
            className="px-2 py-2"
            onClick={() => setOpenDialog("edit")}
          >
            <PencilIcon />
            Edit unit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="px-2 py-2"
            onClick={() => setOpenDialog("delete")}
          >
            <Trash2Icon />
            Delete unit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditSceDialog
        sce={sce}
        open={openDialog === "edit"}
        onOpenChange={(open) => setOpenDialog(open ? "edit" : null)}
      />
      <DeleteSceDialog
        sce={sce}
        open={openDialog === "delete"}
        onOpenChange={(open) => setOpenDialog(open ? "delete" : null)}
      />
    </>
  );
}
