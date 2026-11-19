import { describe, expect, test } from "bun:test";
import {
  formatHoleSize,
  HOLE_SIZES,
  holeSizeSchema,
  sectionCreateSchema,
  sectionUpdateSchema,
} from "./section.schema";

describe("holeSizeSchema", () => {
  test("accepts every standard size", () => {
    for (const size of HOLE_SIZES) {
      expect(holeSizeSchema.safeParse(size).success).toBe(true);
    }
  });

  test("rejects a non-standard size", () => {
    expect(holeSizeSchema.safeParse(18.5).success).toBe(false);
  });
});

describe("formatHoleSize", () => {
  test("formats whole sizes and fractions", () => {
    expect(formatHoleSize(16)).toBe('16"');
    expect(formatHoleSize(3.75)).toBe('3 3/4"');
    expect(formatHoleSize(5.875)).toBe('5 7/8"');
    expect(formatHoleSize(6.125)).toBe('6 1/8"');
    expect(formatHoleSize(8.5)).toBe('8 1/2"');
    expect(formatHoleSize(14.75)).toBe('14 3/4"');
  });
});

const WELL_ID = "00000000-0000-4000-8000-000000000000";

describe("sectionCreateSchema", () => {
  test("accepts a section without an order", () => {
    const result = sectionCreateSchema.safeParse({
      well_id: WELL_ID,
      hole_size: 12.25,
    });

    expect(result.success).toBe(true);
  });

  test("accepts a hole type and an order", () => {
    const result = sectionCreateSchema.safeParse({
      well_id: WELL_ID,
      hole_size: 8.5,
      hole_type: "open_hole",
      order: 2,
    });

    expect(result.success).toBe(true);
  });

  test.each([
    { order: 0 },
    { order: 1.5 },
    { hole_size: 18.5 },
    { hole_type: "tubing" },
    { well_id: "not-a-uuid" },
  ])("rejects %o", (bad) => {
    const result = sectionCreateSchema.safeParse({
      well_id: WELL_ID,
      hole_size: 12.25,
      ...bad,
    });

    expect(result.success).toBe(false);
  });
});

describe("sectionUpdateSchema", () => {
  test("accepts one field", () => {
    expect(sectionUpdateSchema.safeParse({ hole_size: 16 }).success).toBe(true);
  });

  test("accepts null to clear the hole type", () => {
    expect(sectionUpdateSchema.safeParse({ hole_type: null }).success).toBe(
      true,
    );
  });

  test("rejects an empty patch", () => {
    expect(sectionUpdateSchema.safeParse({}).success).toBe(false);
  });
});
