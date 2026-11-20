"use client";

import { Trash2Icon } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useProjects } from "@/features/projects/api";
import { useProjectFilter } from "@/features/projects/project-filter";
import {
  type ProjectProduct,
  useProjectProducts,
  useRemoveProjectProduct,
} from "../api";
import { packageText, projectProductOriginLabel } from "../labels";
import { AddProjectProductForm } from "./add-project-product-form";

const EMPTY_VALUE = "—";

function RemoveButton({ item }: { item: ProjectProduct }) {
  const remove = useRemoveProjectProduct();
  return (
    <Button
      variant="destructive"
      size="icon"
      aria-label={`Remove ${item.product.name}`}
      disabled={remove.isPending}
      onClick={() =>
        remove.mutate(item.id, {
          onSuccess: () =>
            toast.add({ type: "success", title: "Product removed" }),
          // For example: the product is already used in an inventory.
          onError: (error) =>
            toast.add({ type: "error", title: error.message }),
        })
      }
    >
      <Trash2Icon />
    </Button>
  );
}

function ProjectProductsTable({
  items,
  currency,
}: {
  items: ProjectProduct[];
  currency: string | undefined;
}) {
  return (
    <div className="max-h-72 overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-center">Package</TableHead>
            <TableHead className="text-center">Origin</TableHead>
            <TableHead className="text-center">
              Price{currency ? ` (${currency})` : ""}
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-20 text-center text-muted-foreground"
              >
                No products in this project yet.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.product.name}
                </TableCell>
                <TableCell className="text-center">
                  {packageText(item.product) ?? EMPTY_VALUE}
                </TableCell>
                <TableCell className="text-center">
                  {projectProductOriginLabel(item.origin)}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {item.price === null
                    ? EMPTY_VALUE
                    : item.price.toLocaleString("en-US")}
                </TableCell>
                <TableCell>
                  <RemoveButton item={item} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function ProjectProductsContent() {
  const { projectId } = useProjectFilter();
  const projects = useProjects({ page: 1, pageSize: 100, archived: false });
  const project = projects.data?.data.find((item) => item.id === projectId);
  const products = useProjectProducts(projectId);

  if (projectId === null) {
    return (
      <p className="px-4 pb-4 text-muted-foreground">
        Select a project first, then add the products it uses.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {products.isError ? (
        <div className="flex items-center gap-3">
          <p className="text-destructive">{products.error.message}</p>
          <Button variant="outline" onClick={() => products.refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <ProjectProductsTable
          items={products.data?.data ?? []}
          currency={project?.currency}
        />
      )}
      <AddProjectProductForm
        projectId={projectId}
        currency={project?.currency}
        usedProductIds={(products.data?.data ?? []).map(
          (item) => item.product_id,
        )}
      />
    </div>
  );
}

/** The products a project uses. The inventory builds its rows from this list. */
export function ProjectProductsDialog() {
  const [open, setOpen] = useState(false);
  const { projectId } = useProjectFilter();
  const projects = useProjects({ page: 1, pageSize: 100, archived: false });
  const projectName = projects.data?.data.find(
    (item) => item.id === projectId,
  )?.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="h-10 border-0 bg-card px-4" />
        }
      >
        Products of project
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Products of project</DialogTitle>
          <DialogDescription>
            {projectName
              ? `Products used in ${projectName}.`
              : "Products used in a project."}
          </DialogDescription>
        </DialogHeader>
        <ProjectProductsContent />
      </DialogContent>
    </Dialog>
  );
}
