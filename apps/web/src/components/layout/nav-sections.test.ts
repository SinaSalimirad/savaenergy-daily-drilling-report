import { describe, expect, it } from "bun:test";
import { isSectionActive, navSections } from "./nav-sections";

function getSection(label: string) {
  const section = navSections.find((candidate) => candidate.label === label);
  if (!section) throw new Error(`Unknown nav section: ${label}`);
  return section;
}

describe("isSectionActive", () => {
  it("is active on the section's own page", () => {
    expect(
      isSectionActive(getSection("Hydraulics"), "/dashboard/hydraulics"),
    ).toBe(true);
  });

  it("is active on one of its item pages", () => {
    expect(
      isSectionActive(
        getSection("Hydraulics"),
        "/dashboard/hydraulics/bha-bit",
      ),
    ).toBe(true);
  });

  it("is active on a page nested under one of its items", () => {
    expect(
      isSectionActive(
        getSection("Master Data"),
        "/dashboard/master-data/projects/archive",
      ),
    ).toBe(true);
  });

  it("is not active on another section's page", () => {
    expect(isSectionActive(getSection("Hydraulics"), "/dashboard/recap")).toBe(
      false,
    );
  });

  it("does not treat a path that merely starts with the same text as a match", () => {
    expect(
      isSectionActive(
        getSection("Hydraulics"),
        "/dashboard/hydraulics/survey-old",
      ),
    ).toBe(false);
  });

  describe("Dashboard section (its page is the parent of every other page)", () => {
    it("is active on /dashboard", () => {
      expect(isSectionActive(getSection("Dashboard"), "/dashboard")).toBe(true);
    });

    it("is active on its own items", () => {
      expect(
        isSectionActive(getSection("Dashboard"), "/dashboard/well-summary"),
      ).toBe(true);
    });

    it("is not active on pages that belong to other sections", () => {
      expect(
        isSectionActive(
          getSection("Dashboard"),
          "/dashboard/hydraulics/survey",
        ),
      ).toBe(false);
    });
  });
});

describe("navSections", () => {
  it("has no duplicate hrefs", () => {
    const hrefs = navSections.flatMap((section) => [
      section.href,
      ...section.items
        .filter((item) => item.href !== section.href)
        .map((item) => item.href),
    ]);

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("puts every item under its section's href", () => {
    for (const section of navSections) {
      for (const item of section.items) {
        expect(item.href.startsWith(section.href)).toBe(true);
      }
    }
  });

  it("builds item hrefs from their labels", () => {
    const hydraulics = getSection("Hydraulics");
    const bhaAndBit = hydraulics.items.find(
      (item) => item.label === "BHA & bit",
    );

    expect(bhaAndBit?.href).toBe("/dashboard/hydraulics/bha-bit");
  });

  it("adds an Overview item only to the Dashboard section", () => {
    const sectionsWithOverview = navSections
      .filter((section) =>
        section.items.some((item) => item.label === "Overview"),
      )
      .map((section) => section.label);

    expect(sectionsWithOverview).toEqual(["Dashboard"]);
  });
});
