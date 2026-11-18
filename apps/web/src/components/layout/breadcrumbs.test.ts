import { describe, expect, it } from "bun:test";
import { getBreadcrumbs } from "./breadcrumbs";
import { navSections } from "./nav-sections";

describe("getBreadcrumbs", () => {
  it("returns nothing for the root path", () => {
    expect(getBreadcrumbs("/", navSections)).toEqual([]);
  });

  it("uses the menu labels for known section and item paths", () => {
    expect(
      getBreadcrumbs("/dashboard/hydraulics/bha-bit", navSections),
    ).toEqual([
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/hydraulics", label: "Hydraulics" },
      { href: "/dashboard/hydraulics/bha-bit", label: "BHA & bit" },
    ]);
  });

  it("prefers the section label over its own Overview item", () => {
    expect(getBreadcrumbs("/dashboard", navSections)).toEqual([
      { href: "/dashboard", label: "Dashboard" },
    ]);
  });

  it("builds a readable label for a path the menu does not know", () => {
    expect(
      getBreadcrumbs("/dashboard/master-data/projects/archive", navSections),
    ).toEqual([
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/master-data", label: "Master Data" },
      { href: "/dashboard/master-data/projects", label: "Projects" },
      { href: "/dashboard/master-data/projects/archive", label: "Archive" },
    ]);
  });

  it("replaces dashes with spaces in unknown labels", () => {
    const [entry] = getBreadcrumbs("/some-new-page", navSections);

    expect(entry?.label).toBe("Some new page");
  });
});
