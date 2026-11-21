import { beforeEach, describe, expect, test } from "bun:test";
import { call, MISSING_ID, resetDb } from "../../test/helpers";

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

describe("POST /products validation", () => {
  test("trims the name", async () => {
    const name = unique("Barite");

    const { body } = await call("POST", "/products", bulk(`  ${name}  `));

    expect(body.data.name).toBe(name);
  });

  test("a bulk product needs a size, a unit and a gravity", async () => {
    const { status, body } = await call("POST", "/products", {
      kind: "bulk",
      name: unique("Barite"),
    });

    expect(status).toBe(422);
    expect(body.errors.length).toBeGreaterThanOrEqual(3);
  });

  test("a dimensional product needs a length and a width", async () => {
    const { status } = await call("POST", "/products", {
      kind: "dimensional",
      name: unique("Tarpaulin"),
    });

    expect(status).toBe(422);
  });

  test("never stores the fields of another kind", async () => {
    const { status, body } = await call("POST", "/products", {
      ...equipment(unique("Skid")),
      package_size: 25,
    });

    expect(status).toBe(201);
    expect(body.data.package_size).toBeNull();
  });

  test("rejects an empty name, a zero size and an unknown unit or kind", async () => {
    for (const payload of [
      bulk("", {}),
      bulk(unique("A"), { package_size: 0 }),
      bulk(unique("B"), { package_unit: "stone" }),
      { kind: "liquid", name: unique("C") },
    ]) {
      const { status } = await call("POST", "/products", payload);
      expect(status).toBe(422);
    }
  });
});

describe("GET /products", () => {
  test("lists products by name with a total, and pages them", async () => {
    const tag = unique("List");
    for (const letter of ["c", "a", "b"]) {
      await call("POST", "/products", equipment(`${tag} ${letter}`));
    }

    const { body } = await call("GET", "/products?page=1&pageSize=100");
    const mine = body.data
      .map((product: { name: string }) => product.name)
      .filter((name: string) => name.startsWith(tag));
    const paged = await call("GET", "/products?page=1&pageSize=1");

    expect(mine).toEqual([`${tag} a`, `${tag} b`, `${tag} c`]);
    expect(paged.body.data).toHaveLength(1);
    expect(paged.body.meta.total).toBeGreaterThanOrEqual(3);
  });

  test("rejects a page size above 100 with 422", async () => {
    const { status } = await call("GET", "/products?pageSize=101");

    expect(status).toBe(422);
  });
});

describe("GET, PATCH and DELETE /products/:id", () => {
  test("gets one product", async () => {
    const { body } = await call("POST", "/products", bulk(unique("Barite")));

    const { status, body: found } = await call(
      "GET",
      `/products/${body.data.id}`,
    );

    expect(status).toBe(200);
    expect(found.data).toMatchObject({ kind: "bulk", package_size: 25 });
  });

  test("changing the kind clears the fields of the old kind", async () => {
    const { body } = await call("POST", "/products", bulk(unique("Barite")));

    const { status, body: changed } = await call(
      "PATCH",
      `/products/${body.data.id}`,
      equipment(unique("Skid")),
    );

    expect(status).toBe(200);
    expect(changed.data).toMatchObject({
      kind: "equipment",
      package_size: null,
      package_unit: null,
      specific_gravity: null,
    });
  });

  test("deletes an unused product", async () => {
    const { body } = await call("POST", "/products", equipment(unique("Skid")));

    const deleted = await call("DELETE", `/products/${body.data.id}`);
    const after = await call("GET", `/products/${body.data.id}`);

    expect(deleted.status).toBe(204);
    expect(after.status).toBe(404);
  });

  test("refuses to delete a product that a project uses with 409", async () => {
    const { body } = await call("POST", "/products", equipment(unique("Skid")));
    const project = await call("POST", "/projects", {
      name: unique("P"),
      operator: "Op",
      contractor: "Co",
      field: "F",
      well_count: 1,
      currency: "USD",
    });
    await call("POST", "/project-products", {
      project_id: project.body.data.id,
      product_id: body.data.id,
      origin: "local",
    });

    const { status, body: error } = await call(
      "DELETE",
      `/products/${body.data.id}`,
    );

    expect(status).toBe(409);
    expect(error.code).toBe("PRODUCT_IN_USE");
  });

  test("returns 404 for an unknown id on every method", async () => {
    const path = `/products/${MISSING_ID}`;

    expect((await call("GET", path)).status).toBe(404);
    expect((await call("PATCH", path, equipment(unique("X")))).status).toBe(
      404,
    );
    expect((await call("DELETE", path)).status).toBe(404);
  });
});
