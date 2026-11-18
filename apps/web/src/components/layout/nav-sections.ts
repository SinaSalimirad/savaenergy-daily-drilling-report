export type NavItem = {
  label: string;
  href: string;
};

export type NavSection = {
  label: string;
  href: string;
  items: NavItem[];
};

// The raw menu data: item hrefs are derived from their labels below.
type NavSectionConfig = {
  label: string;
  href: string;
  itemLabels: string[];
};

const navSectionConfigs: NavSectionConfig[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    itemLabels: ["Overview", "Well summary", "Fleet"],
  },
  {
    label: "Daily Reports",
    href: "/dashboard/daily-reports",
    itemLabels: ["Report list", "Report editor", "Activities", "Remarks"],
  },
  {
    label: "Fluid Properties",
    href: "/dashboard/fluid-properties",
    itemLabels: ["Mud samples", "Rheology", "Solids analysis", "Salt tables"],
  },
  {
    label: "Volumes & Pits",
    href: "/dashboard/volumes-and-pits",
    itemLabels: ["Pit readings", "Volume accounting", "Losses"],
  },
  {
    label: "Inventory & Cost",
    href: "/dashboard/inventory-and-cost",
    itemLabels: ["Stock", "Products used", "Price list", "Cost"],
  },
  {
    label: "Hydraulics",
    href: "/dashboard/hydraulics",
    itemLabels: [
      "Wellbore geometry",
      "BHA & bit",
      "Survey",
      "Pressure loss",
      "Hole cleaning",
    ],
  },
  {
    label: "Recap",
    href: "/dashboard/recap",
    itemLabels: ["Section recap", "Well recap", "Charts"],
  },
  {
    label: "Master Data",
    href: "/dashboard/master-data",
    itemLabels: [
      "Projects",
      "Wells",
      "Sections",
      "Pits",
      "Pumps",
      "Solids control",
      "Products",
    ],
  },
  {
    label: "Settings & Integrations",
    href: "/dashboard/settings",
    itemLabels: ["General", "Integrations"],
  },
];

// "BHA & bit" -> "bha-bit"
function toSlug(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toNavSection(config: NavSectionConfig): NavSection {
  const items = config.itemLabels.map((label) => ({
    label,
    href: `${config.href}/${toSlug(label)}`,
  }));

  return { label: config.label, href: config.href, items };
}

export const navSections: NavSection[] = navSectionConfigs.map(toNavSection);
