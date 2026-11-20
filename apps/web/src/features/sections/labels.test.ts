import { describe, expect, it } from "bun:test";
import { HOLE_SIZES } from "schema";
import {
  HOLE_SIZE_OPTIONS,
  HOLE_TYPE_OPTIONS,
  holeTypeLabel,
  NONE,
} from "./labels";

describe("HOLE_SIZE_OPTIONS", () => {
  it("lists every standard size, largest first", () => {
    const sizes = HOLE_SIZE_OPTIONS.map((option) => Number(option.value));

    expect(sizes).toHaveLength(HOLE_SIZES.length);
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
    expect(sizes[0]).toBe(26);
    expect(sizes.at(-1)).toBe(3.75);
  });

  it("writes the size as inches and fractions", () => {
    const labels = Object.fromEntries(
      HOLE_SIZE_OPTIONS.map((o) => [o.value, o.label]),
    );

    expect(labels["14.75"]).toBe('14 3/4"');
    expect(labels["16"]).toBe('16"');
  });

  it("does not reorder the shared list of sizes", () => {
    const before = [...HOLE_SIZES];

    expect(HOLE_SIZE_OPTIONS.length).toBe(before.length);
    expect([...HOLE_SIZES]).toEqual(before);
  });
});

describe("hole types", () => {
  it("starts with 'Not set' and labels every type", () => {
    expect(HOLE_TYPE_OPTIONS[0]).toEqual({ value: NONE, label: "Not set" });
    expect(holeTypeLabel("open_hole")).toBe("Open hole");
    expect(holeTypeLabel("casing")).toBe("Casing");
  });
});
