import { describe, expect, it } from "bun:test";
import { makeProduct } from "@/test/fixtures";
import {
  ORIGIN_OPTIONS,
  packageText,
  projectProductOriginLabel,
} from "./labels";

describe("packageText", () => {
  it("writes a bulk package as size and unit", () => {
    expect(
      packageText(makeProduct({ package_size: 25, package_unit: "kg" })),
    ).toBe("25 kg");
    expect(
      packageText(makeProduct({ package_size: 55, package_unit: "gal" })),
    ).toBe("55 gal");
  });

  it("uses the display label of the unit", () => {
    expect(
      packageText(makeProduct({ package_size: 1, package_unit: "m3" })),
    ).toBe("1 m³");
  });

  it("writes a dimensional product as length x width", () => {
    const tarpaulin = makeProduct({
      kind: "dimensional",
      package_size: null,
      package_unit: null,
      specific_gravity: null,
      length_m: 10,
      width_m: 15,
    });

    expect(packageText(tarpaulin)).toBe("10*15 m");
  });

  it("has no package for equipment", () => {
    const skid = makeProduct({
      kind: "equipment",
      package_size: null,
      package_unit: null,
      specific_gravity: null,
    });

    expect(packageText(skid)).toBeNull();
  });
});

describe("origin labels", () => {
  it("labels both origins", () => {
    expect(projectProductOriginLabel("local")).toBe("Local");
    expect(projectProductOriginLabel("foreign")).toBe("Foreign");
    expect(ORIGIN_OPTIONS.map((option) => option.value)).toEqual([
      "foreign",
      "local",
    ]);
  });
});
