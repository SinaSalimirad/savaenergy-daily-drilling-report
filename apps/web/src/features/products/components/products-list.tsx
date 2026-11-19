"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectsPagination } from "@/features/projects/components/projects-pagination";
import { useProducts } from "../api";
import { ProductsTable } from "./products-table";

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_MESSAGE = "No products yet.";

// Loading, error, table and pagination.
export function ProductsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const products = useProducts({ page, pageSize });

  const total = products.data?.meta.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  // Deleting the last row of the last page leaves that page empty: step back one page.
  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  return (
    <div className="mt-6 rounded-xl bg-card px-3 py-5">
      {products.isPending && (
        // The status is for screen readers; sighted users see the placeholder rows.
        <div role="status" aria-label="Loading products">
          <ProductsTable data={[]} emptyMessage={EMPTY_MESSAGE} isLoading />
        </div>
      )}

      {products.isError && (
        <div className="flex items-center gap-3 p-4">
          <p className="text-destructive">{products.error.message}</p>
          <Button variant="outline" onClick={() => products.refetch()}>
            Try again
          </Button>
        </div>
      )}

      {products.data && (
        <>
          <ProductsTable
            data={products.data.data}
            emptyMessage={EMPTY_MESSAGE}
          />
          <ProjectsPagination
            itemLabel="product(s)"
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              // The old page number may not exist with the new size: start from the top.
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}
