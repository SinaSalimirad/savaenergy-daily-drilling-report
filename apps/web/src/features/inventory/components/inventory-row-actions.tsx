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
import type { InventoryRow } from "../api";
import { DeleteInventoryRowDialog } from "./delete-inventory-row-dialog";
import { EditInventoryRowDialog } from "./edit-inventory-row-dialog";

// The dialogs live outside the menu: the menu content unmounts as soon as an item is clicked,
// and it would take the dialog with it.
type OpenDialog = "edit" | "delete" | null;

export function InventoryRowActions({ row }: { row: InventoryRow }) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${row.product.name}`}
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
            Edit row
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="px-2 py-2"
            onClick={() => setOpenDialog("delete")}
          >
            <Trash2Icon />
            Remove row
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditInventoryRowDialog
        row={row}
        open={openDialog === "edit"}
        onOpenChange={(open) => setOpenDialog(open ? "edit" : null)}
      />
      <DeleteInventoryRowDialog
        row={row}
        open={openDialog === "delete"}
        onOpenChange={(open) => setOpenDialog(open ? "delete" : null)}
      />
    </>
  );
}
