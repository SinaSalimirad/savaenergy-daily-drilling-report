import { describe, expect, test } from "bun:test";
import {
  dailyCost,
  finalStock,
  type Movement,
  totalsFor,
} from "./inventory.calc";

const move = (
  reportDate: string,
  overrides: Partial<Movement> = {},
): Movement => ({
  projectProductId: "p1",
  reportDate,
  sectionId: "s1",
  received: 0,
  used: 0,
  returned: 0,
  ...overrides,
});

const target = {
  projectProductId: "p1",
  reportDate: "2026-03-10",
  sectionId: "s1",
};

describe("totalsFor", () => {
  test("adds up the days of the month and of the whole history", () => {
    const history = [
      move("2026-02-27", { received: 10, used: 1 }),
      move("2026-03-01", { received: 5, used: 2 }),
      move("2026-03-10", { used: 3, returned: 1 }),
    ];

    expect(totalsFor(history, target)).toEqual({
      section_used: 6,
      monthly_received: 5,
      monthly_used: 5,
      cumulative_received: 15,
      cumulative_used: 6,
      cumulative_returned: 1,
    });
  });

  test("ignores later days and other products", () => {
    const history = [
      move("2026-03-11", { used: 100 }),
      move("2026-03-05", { used: 100, projectProductId: "p2" }),
      move("2026-03-05", { used: 4 }),
    ];

    expect(totalsFor(history, target).cumulative_used).toBe(4);
  });

  test("section used counts only the section of the report", () => {
    const history = [
      move("2026-03-05", { used: 7, sectionId: "s0" }),
      move("2026-03-06", { used: 2 }),
    ];

    const totals = totalsFor(history, target);

    expect(totals.section_used).toBe(2);
    expect(totals.cumulative_used).toBe(9);
  });
});

describe("finalStock", () => {
  test("adds what came in and removes what went out", () => {
    expect(finalStock({ initial: 10, received: 5, used: 3, returned: 2 })).toBe(
      10,
    );
  });
});

describe("dailyCost", () => {
  const base = { length_m: null, width_m: null, used: 0, final_stock: 0 };

  test("bulk: used packages times the price", () => {
    expect(dailyCost({ ...base, kind: "bulk", price: 12.5, used: 3 })).toBe(
      37.5,
    );
  });

  test("dimensional: used items times their area times the price per m²", () => {
    expect(
      dailyCost({
        ...base,
        kind: "dimensional",
        price: 2,
        used: 2,
        length_m: 10,
        width_m: 5,
      }),
    ).toBe(200);
  });

  test("equipment: units on site times the daily price", () => {
    expect(
      dailyCost({ ...base, kind: "equipment", price: 50, final_stock: 4 }),
    ).toBe(200);
  });

  test("is null without a price", () => {
    expect(
      dailyCost({ ...base, kind: "bulk", price: null, used: 3 }),
    ).toBeNull();
  });

  test("hides float noise", () => {
    expect(dailyCost({ ...base, kind: "bulk", price: 0.1, used: 3 })).toBe(0.3);
  });
});
