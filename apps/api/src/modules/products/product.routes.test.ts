import { beforeEach, describe, expect, test } from "bun:test";
import { call, resetDb } from "../../test/helpers";

beforeEach(resetDb);

// A duplicate is refused, so every test uses names that no other test (or run) used.
let counter = 0;
const unique = (name: string) => `${name} ${Date.now()}-${++counter}`;

const bulk = (name: string, overrides: object = {}) => ({
  kind: "bulk",
  name,
  package_size: 25,
  package_unit: "kg",
  specific_gravity: 4.2,
  ...overrides,
});
const dimensional = (name: string, overrides: object = {}) => ({
  kind: "dimensional",
  name,
  length_m: 10,
  width_m: 5,
  ...overrides,
});
const equipment = (name: string) => ({ kind: "equipment", name });

async function expectDuplicate(first: object, second: object) {
  expect((await call("POST", "/products", first)).status).toBe(201);
  const { status, body } = await call("POST", "/products", second);
  expect(status).toBe(409);
  expect(body.code).toBe("PRODUCT_EXISTS");
}

async function expectAllowed(first: object, second: object) {
  expect((await call("POST", "/products", first)).status).toBe(201);
  expect((await call("POST", "/products", second)).status).toBe(201);
}

describe("bulk products", () => {
  test("the same name, size, unit and gravity is refused", async () => {
    const name = unique("Barite");
    await expectDuplicate(bulk(name), bulk(name));
  });

  test("the name ignores upper and lower case", async () => {
    const name = unique("Barite");
    await expectDuplicate(bulk(name), bulk(name.toUpperCase()));
  });

  test.each([
    ["name", () => ({ name: unique("Hematite") })],
    ["package size", () => ({ package_size: 50 })],
    ["package unit", () => ({ package_unit: "lb" })],
    ["specific gravity", () => ({ specific_gravity: 5.1 })],
  ])("a different %s is allowed", async (_label, change) => {
    const name = unique("Barite");
    await expectAllowed(bulk(name), bulk(name, change()));
  });
});

describe("dimensional products", () => {
  test("the same name, length and width is refused", async () => {
    const name = unique("Tarpaulin");
    await expectDuplicate(dimensional(name), dimensional(name));
  });

  test.each([
    ["name", () => ({ name: unique("Cover") })],
    ["length", () => ({ length_m: 15 })],
    ["width", () => ({ width_m: 6 })],
  ])("a different %s is allowed", async (_label, change) => {
    const name = unique("Tarpaulin");
    await expectAllowed(dimensional(name), dimensional(name, change()));
  });
});

describe("equipment", () => {
  test("the same name is refused", async () => {
    const name = unique("Mud Skid");
    await expectDuplicate(equipment(name), equipment(name));
  });

  test("a different name is allowed", async () => {
    await expectAllowed(equipment(unique("Skid")), equipment(unique("Shaker")));
  });
});

describe("kinds do not clash", () => {
  test("a bulk product and equipment may share a name", async () => {
    const name = unique("Barite");
    await expectAllowed(bulk(name), equipment(name));
  });
});

describe("PATCH /products/:id", () => {
  test("cannot turn a product into a copy of another one", async () => {
    const taken = unique("Shaker");
    await call("POST", "/products", equipment(taken));
    const { body } = await call("POST", "/products", equipment(unique("Skid")));

    const { status, body: error } = await call(
      "PATCH",
      `/products/${body.data.id}`,
      equipment(taken.toLowerCase()),
    );

    expect(status).toBe(409);
    expect(error.code).toBe("PRODUCT_EXISTS");
  });

  test("saving a product unchanged is fine", async () => {
    const product = equipment(unique("Skid"));
    const { body } = await call("POST", "/products", product);

    const { status } = await call(
      "PATCH",
      `/products/${body.data.id}`,
      product,
    );

    expect(status).toBe(200);
  });
});
