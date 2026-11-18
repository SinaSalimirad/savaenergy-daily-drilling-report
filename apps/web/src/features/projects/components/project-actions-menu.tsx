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
import { type Project, useArchiveProject, useRestoreProject } from "../api";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { EditProjectDialog } from "./edit-project-dialog";

// View is not wired yet. Archive and Restore need no extra UI, so they call the API
// directly. Edit and Delete open a dialog, which lives outside the menu: the menu content
// unmounts as soon as an item is clicked, and it would take the dialog with it.
type OpenDialog = "edit" | "delete" | null;

export function ProjectActionsMenu({ project }: { project: Project }) {
  const archive = useArchiveProject();
  const restore = useRestoreProject();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const isArchived = project.status === "archived";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${project.name}`}
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
            <DropdownMenuLabel>Project actions</DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuItem className="px-2 py-2">
            <EyeIcon />
            View details
          </DropdownMenuItem>
          {/* The API does not accept status "archived" in an edit, so an archived project
            is restored first. */}
          {!isArchived && (
            <DropdownMenuItem
              className="px-2 py-2"
              onClick={() => setOpenDialog("edit")}
            >
              <PencilIcon />
              Edit project
            </DropdownMenuItem>
          )}
          {isArchived ? (
            <DropdownMenuItem
              className="px-2 py-2"
              disabled={restore.isPending}
              onClick={() =>
                restore.mutate(project.id, {
                  onSuccess: () =>
                    toast.add({ type: "success", title: "Project restored" }),
                })
              }
            >
              <ArchiveRestoreIcon />
              Restore project
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="px-2 py-2"
              disabled={archive.isPending}
              onClick={() =>
                archive.mutate(project.id, {
                  onSuccess: () =>
                    toast.add({ type: "success", title: "Project archived" }),
                })
              }
            >
              <ArchiveIcon />
              Archive project
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="px-2 py-2"
            onClick={() => setOpenDialog("delete")}
          >
            <Trash2Icon />
            Delete project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditProjectDialog
        project={project}
        open={openDialog === "edit"}
        onOpenChange={(open) => setOpenDialog(open ? "edit" : null)}
      />
      <DeleteProjectDialog
        project={project}
        open={openDialog === "delete"}
        onOpenChange={(open) => setOpenDialog(open ? "delete" : null)}
      />
    </>
  );
}
