"use client";

import {
  CheckIcon,
  PackagePlusIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import type { ProjectProductOrigin } from "schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
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
import { ApiError } from "@/lib/api-error";
import {
  type ProjectProduct,
  useProjectProducts,
  useRemoveProjectProduct,
  useUpdateProjectProduct,
} from "../api";
import {
  ORIGIN_OPTIONS,
  packageText,
  projectProductOriginLabel,
} from "../labels";
import { AddProjectProductForm } from "./add-project-product-form";

const EMPTY_VALUE = "—";

// Removing takes two steps: the trash icon asks, "Confirm" removes. "Cancel" (or the X) backs out.
function RemoveButton({
  item,
  confirming,
  onConfirmingChange,
}: {
  item: ProjectProduct;
  confirming: boolean;
  onConfirmingChange: (confirming: boolean) => void;
}) {
  const remove = useRemoveProjectProduct();

  if (!confirming) {
    return (
      <Button
        variant="destructive"
        size="icon"
        aria-label={`Remove ${item.product.name}`}
        onClick={() => onConfirmingChange(true)}
      >
        <Trash2Icon />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="destructive"
        className="w-24"
        aria-label={`Confirm removing ${item.product.name}`}
        disabled={remove.isPending}
        onClick={() =>
          remove.mutate(item.id, {
            onSuccess: () =>
              toast.add({ type: "success", title: "Product removed" }),
            // For example: the product is already used in an inventory.
            onError: (error) => {
              toast.add({ type: "error", title: error.message });
              onConfirmingChange(false);
            },
          })
        }
      >
        {remove.isPending ? "Removing…" : "Confirm"}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Cancel removing"
        disabled={remove.isPending}
        onClick={() => onConfirmingChange(false)}
      >
        <XIcon />
      </Button>
    </>
  );
}

function ProjectProductRow({ item }: { item: ProjectProduct }) {
  const [editing, setEditing] = useState(false);
  // While the removal waits for its second click, the edit icon is hidden.
  const [confirming, setConfirming] = useState(false);
  const [origin, setOrigin] = useState<ProjectProductOrigin>(item.origin);
  // Kept as text while typing; empty means "no price".
  const [price, setPrice] = useState(
    item.price === null ? "" : String(item.price),
  );
  const update = useUpdateProjectProduct();

  function startEditing() {
    setOrigin(item.origin);
    setPrice(item.price === null ? "" : String(item.price));
    update.reset();
    setEditing(true);
  }

  function save() {
    update.mutate(
      {
        id: item.id,
        body: { origin, price: price === "" ? null : Number(price) },
      },
      {
        onSuccess: () => {
          toast.add({ type: "success", title: "Product updated" });
          setEditing(false);
        },
      },
    );
  }

  const priceError =
    update.error instanceof ApiError
      ? update.error.fieldErrors.price
      : undefined;
  const otherError =
    update.error && !priceError ? update.error.message : undefined;

  return (
    <TableRow>
      <TableCell className="font-medium">{item.product.name}</TableCell>
      <TableCell className="text-center">
        {packageText(item.product) ?? EMPTY_VALUE}
      </TableCell>
      <TableCell className="text-center">
        {editing ? (
          <SimpleSelect
            options={ORIGIN_OPTIONS}
            value={origin}
            onValueChange={(value) =>
              value && setOrigin(value as ProjectProductOrigin)
            }
          />
        ) : (
          projectProductOriginLabel(item.origin)
        )}
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {editing ? (
          <div className="flex flex-col gap-1">
            <Input
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="No price"
              aria-label={`Price of ${item.product.name}`}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              aria-invalid={Boolean(priceError)}
            />
            {(priceError ?? otherError) && (
              <p className="text-destructive text-xs">
                {priceError ?? otherError}
              </p>
            )}
          </div>
        ) : item.price === null ? (
          EMPTY_VALUE
        ) : (
          item.price.toLocaleString("en-US")
        )}
      </TableCell>
      <TableCell>
        <div className="flex h-9 w-36 items-center justify-end gap-1">
          {editing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Save ${item.product.name}`}
                disabled={update.isPending}
                onClick={save}
              >
                <CheckIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cancel editing"
                disabled={update.isPending}
                onClick={() => setEditing(false)}
              >
                <XIcon />
              </Button>
            </>
          ) : (
            <>
              {!confirming && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${item.product.name}`}
                  onClick={startEditing}
                >
                  <PencilIcon />
                </Button>
              )}
              <RemoveButton
                item={item}
                confirming={confirming}
                onConfirmingChange={setConfirming}
              />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
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
            <TableHead className="w-40" />
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
            items.map((item) => <ProjectProductRow key={item.id} item={item} />)
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
        <PackagePlusIcon data-icon="inline-start" />
        Manage products
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project products</DialogTitle>
          <DialogDescription>
            {projectName
              ? `Add, edit or remove the products used in ${projectName}. The inventory is built from this list.`
              : "Add, edit or remove the products used in a project."}
          </DialogDescription>
        </DialogHeader>
        <ProjectProductsContent />
      </DialogContent>
    </Dialog>
  );
}
