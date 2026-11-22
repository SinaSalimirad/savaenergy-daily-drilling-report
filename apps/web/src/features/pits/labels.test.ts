import { describe, expect, it } from "bun:test";
import { formatCapacity, PIT_TYPE_OPTIONS, pitTypeLabel } from "./labels";

describe("pit labels", () => {
  it("names each pit type", () => {
    expect(pitTypeLabel("active")).toBe("Active");
    expect(pitTypeLabel("reserve")).toBe("Reserve");
    expect(pitTypeLabel("not mud")).toBe("Not mud");
  });

  it("offers every pit type in a select", () => {
    expect(PIT_TYPE_OPTIONS.map((option) => option.value)).toEqual([
      "active",
      "reserve",
      "not mud",
    ]);
  });

  it("shows capacities with two decimals and a thousands separator", () => {
    expect(formatCapacity(250)).toBe("250.00");
    expect(formatCapacity(1250.5)).toBe("1,250.50");
  });
});
