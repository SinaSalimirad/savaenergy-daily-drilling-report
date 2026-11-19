"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;

const pageSizeItems = PAGE_SIZE_OPTIONS.map((size) => ({
  value: String(size),
  label: String(size),
}));

/**
 * Footer of the projects table: total, rows per page, "Page X of Y" and first/previous/next/last
 * buttons. It is always shown, so the page size can be changed even when there is one page.
 */
export function ProjectsPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  itemLabel = "project(s)",
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Shown after the total, e.g. "12 well(s)". */
  itemLabel?: string;
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const onFirstPage = page <= 1;
  const onLastPage = page >= lastPage;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 pt-4">
      <p className="text-sm text-muted-foreground">
        {total} {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <span id="rows-per-page" className="text-sm font-medium">
            Rows per page
          </span>
          <Select
            items={pageSizeItems}
            value={String(pageSize)}
            onValueChange={(value) => {
              if (value) onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger aria-labelledby="rows-per-page" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-20">
              {pageSizeItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm font-medium tabular-nums">
          Page {page} of {lastPage}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Go to first page"
            disabled={onFirstPage}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Go to previous page"
            disabled={onFirstPage}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Go to next page"
            disabled={onLastPage}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Go to last page"
            disabled={onLastPage}
            onClick={() => onPageChange(lastPage)}
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
