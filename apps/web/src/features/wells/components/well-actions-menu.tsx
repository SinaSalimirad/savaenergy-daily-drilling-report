"use client";

import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
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
import type { Well } from "../api";
import { DeleteWellDialog } from "./delete-well-dialog";
import { EditWellDialog } from "./edit-well-dialog";

// View is not wired yet. Edit and Delete open a dialog, which lives outside the menu: the menu content
// unmounts as soon as an item is clicked, and it would take the dialog with it.
type OpenDialog = "edit" | "delete" | null;

export function WellActionsMenu({ well }: { well: Well }) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${well.name}`}
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
            <DropdownMenuLabel>Well actions</DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuItem className="px-2 py-2">
            <EyeIcon />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem
            className="px-2 py-2"
            onClick={() => setOpenDialog("edit")}
          >
            <PencilIcon />
            Edit well
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="px-2 py-2"
            onClick={() => setOpenDialog("delete")}
          >
            <Trash2Icon />
            Delete well
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditWellDialog
        well={well}
        open={openDialog === "edit"}
        onOpenChange={(open) => setOpenDialog(open ? "edit" : null)}
      />
      <DeleteWellDialog
        well={well}
        open={openDialog === "delete"}
        onOpenChange={(open) => setOpenDialog(open ? "delete" : null)}
      />
    </>
  );
}
