"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBreadcrumbs } from "./breadcrumbs";
import { navSections } from "./nav-sections";

export function PanelBreadcrumb() {
  const pathname = usePathname();
  const entries = getBreadcrumbs(pathname, navSections);

  if (entries.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="px-16 py-3">
      <BreadcrumbList className="text-sm">
        {entries.map((entry, index) => {
          const isLast = index === entries.length - 1;

          return (
            <Fragment key={entry.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{entry.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={entry.href} />}>
                    {entry.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
