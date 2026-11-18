import type { NavSection } from "./nav-sections";

export type BreadcrumbEntry = {
  label: string;
  href: string;
};

// Every known section and item href mapped to its label.
function buildLabelsByHref(sections: NavSection[]) {
  const labelsByHref = new Map<string, string>();

  for (const section of sections) {
    labelsByHref.set(section.href, section.label);
    for (const item of section.items) {
      labelsByHref.set(item.href, item.label);
    }
  }

  return labelsByHref;
}

// "well-summary" -> "Well summary". Only used for paths the menu does not know.
function labelFromSegment(segment: string) {
  const text = segment.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "/dashboard/hydraulics/bha-bit" -> Dashboard, Hydraulics, BHA & bit
export function getBreadcrumbs(
  pathname: string,
  sections: NavSection[],
): BreadcrumbEntry[] {
  const labelsByHref = buildLabelsByHref(sections);
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    return { href, label: labelsByHref.get(href) ?? labelFromSegment(segment) };
  });
}
