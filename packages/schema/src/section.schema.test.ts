import { describe, expect, test } from "bun:test";
import { formatHoleSize, HOLE_SIZES, holeSizeSchema } from "./section.schema";

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
