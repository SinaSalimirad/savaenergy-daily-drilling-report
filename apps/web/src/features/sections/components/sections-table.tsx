"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { cn } from "cn";
import { GripVerticalIcon } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { formatHoleSize } from "schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { type Section, useMoveSection } from "../api";
import { holeTypeLabel } from "../labels";
import { SectionActionsMenu } from "./section-actions-menu";

// No optional features (sorting, filtering, pagination): the server owns those, and the
// order of the rows is the order of the sections.
const features = tableFeatures({});

const columnHelper = createColumnHelper<typeof features, Section>();

const EMPTY_VALUE = "—";

const CENTERED_COLUMN_IDS = new Set(["order", "hole_size", "hole_type"]);

function alignClass(columnId: string) {
  return CENTERED_COLUMN_IDS.has(columnId) ? "text-center" : undefined;
}

/** The grip a row is dragged by. It also works from the keyboard (Space, then arrow keys). */
function DragHandle({ section }: { section: Section }) {
  const { attributes, listeners } = useSortable({ id: section.id });

  return (
    <Button
      {...attributes}
      {...listeners}
      type="button"
      variant="ghost"
      size="icon-sm"
      className="cursor-grab text-muted-foreground hover:bg-transparent active:cursor-grabbing"
      aria-label={`Drag to reorder section ${section.order} of ${section.well_name}`}
    >
      <GripVerticalIcon />
    </Button>
  );
}

const columns = columnHelper.columns([
  columnHelper.display({
    id: "drag",
    header: () => <span className="sr-only">Reorder</span>,
    cell: ({ row }) => <DragHandle section={row.original} />,
  }),
  columnHelper.accessor("well_name", { header: "Well" }),
  columnHelper.accessor("project_name", { header: "Project" }),
  columnHelper.accessor("order", { header: "Order" }),
  columnHelper.accessor("hole_size", {
    header: "Hole size",
    cell: (info) => formatHoleSize(info.getValue()),
  }),
  columnHelper.accessor("hole_type", {
    header: "Hole type",
    cell: (info) => {
      const type = info.getValue();
      return type ? holeTypeLabel(type) : EMPTY_VALUE;
    },
  }),
  columnHelper.display({
    id: "actions",
    header: () => (
      <span className="flex items-center justify-end">Actions</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <SectionActionsMenu section={row.original} />
      </div>
    ),
  }),
]);

// Spacing of the shadcn data-table block: roomy rows, 16px of padding on the sides.
const HEAD_CELL = "px-2";
const BODY_CELL = "h-[68px] px-2";

const SKELETON_ROWS = 10;

function DraggableRow({ id, children }: { id: string; children: ReactNode }) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {children}
    </TableRow>
  );
}

/**
 * Rows are dragged to change the order of the sections. The order numbers follow the rows,
 * so the section at the top has the order closest to 1. A section can only move inside its
 * own well. With `isLoading`, the header stays and the body becomes placeholder rows.
 */
export function SectionsTable({
  data,
  emptyMessage,
  isLoading = false,
}: {
  data: Section[];
  emptyMessage: string;
  isLoading?: boolean;
}) {
  const moveSection = useMoveSection();
  // The rows right after a drop, until the server answers: the table moves at once and
  // returns to `data` when the list is refreshed or the move fails.
  const [dropped, setDropped] = useState<Section[] | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: the effect must run when `data` changes.
  useEffect(() => {
    setDropped(null);
  }, [data]);
  const rows = dropped ?? data;

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (section) => section.id,
  });

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = rows.findIndex((section) => section.id === active.id);
    const to = rows.findIndex((section) => section.id === over.id);
    const moved = rows[from];
    const target = rows[to];
    if (!moved || !target) return;

    if (moved.well_id !== target.well_id) {
      toast.add({
        type: "error",
        title: "A section can only move inside its own well",
      });
      return;
    }

    // The rows of this well keep the same set of order numbers, only in a new sequence.
    const orders = rows
      .filter((section) => section.well_id === moved.well_id)
      .map((section) => section.order);
    let next = 0;
    setDropped(
      arrayMove(rows, from, to).map((section) =>
        section.well_id === moved.well_id
          ? { ...section, order: orders[next++] ?? section.order }
          : section,
      ),
    );

    moveSection.mutate(
      { id: moved.id, toOrder: target.order },
      {
        onError: (error) => {
          setDropped(null);
          toast.add({ type: "error", title: error.message });
        },
      },
    );
  }

  return (
    <div className="overflow-hidden">
      <DndContext
        collisionDetection={closestCenter}
        // Vertical only, and never outside the table body, so dragging down cannot scroll the page away.
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    scope="col"
                    className={cn(HEAD_CELL, alignClass(header.column.id))}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROWS }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows have no identity
                <TableRow key={index}>
                  {table.getAllLeafColumns().map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(BODY_CELL, alignClass(column.id))}
                    >
                      <Skeleton
                        className={
                          column.id === "actions" || column.id === "drag"
                            ? cn("size-7", column.id === "actions" && "ml-auto")
                            : cn(
                                "h-4 w-3/4",
                                CENTERED_COLUMN_IDS.has(column.id) && "mx-auto",
                              )
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 px-2 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext
                items={rows.map((section) => section.id)}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} id={row.id}>
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(BODY_CELL, alignClass(cell.column.id))}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </DraggableRow>
                ))}
              </SortableContext>
            )}
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}
