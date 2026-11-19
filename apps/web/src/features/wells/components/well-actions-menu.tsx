"use client";

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
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
import { toast } from "@/components/ui/toast";
import { useArchiveWell, useRestoreWell, type Well } from "../api";
import { DeleteWellDialog } from "./delete-well-dialog";
import { EditWellDialog } from "./edit-well-dialog";

// View is not wired yet. Archive and Restore need no extra UI, so they call the API
// directly. Edit and Delete open a dialog, which lives outside the menu: the menu content
// unmounts as soon as an item is clicked, and it would take the dialog with it.
type OpenDialog = "edit" | "delete" | null;

export function WellActionsMenu({ well }: { well: Well }) {
  const archive = useArchiveWell();
  const restore = useRestoreWell();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const isArchived = well.status === "archived";

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
          {/* The API does not accept status "archived" in an edit, so an archived well
            is restored first. */}
          {!isArchived && (
            <DropdownMenuItem
              className="px-2 py-2"
              onClick={() => setOpenDialog("edit")}
            >
              <PencilIcon />
              Edit well
            </DropdownMenuItem>
          )}
          {isArchived ? (
            <DropdownMenuItem
              className="px-2 py-2"
              disabled={restore.isPending}
              onClick={() =>
                restore.mutate(well.id, {
                  onSuccess: () =>
                    toast.add({ type: "success", title: "Well restored" }),
                })
              }
            >
              <ArchiveRestoreIcon />
              Restore well
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="px-2 py-2"
              disabled={archive.isPending}
              onClick={() =>
                archive.mutate(well.id, {
                  onSuccess: () =>
                    toast.add({ type: "success", title: "Well archived" }),
                })
              }
            >
              <ArchiveIcon />
              Archive well
            </DropdownMenuItem>
          )}
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
