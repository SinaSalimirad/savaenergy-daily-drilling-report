import { beforeEach, describe, expect, test } from "bun:test";
import {
  call,
  createDailyReport,
  createProject,
  createSection,
  createWell,
  MISSING_ID,
  resetDb,
} from "../../test/helpers";

beforeEach(resetDb);

async function createProduct(
  name: string,
  body: object = { kind: "equipment" },
) {
  const { status, body: res } = await call("POST", "/products", {
    name,
    ...body,
  });
  if (status !== 201) throw new Error(`Could not create a product: ${status}`);
  return res.data;
}

async function addToProject(
  projectId: string,
  productId: string,
  price: number | null = null,
) {
  const { status, body } = await call("POST", "/project-products", {
    project_id: projectId,
    product_id: productId,
    origin: "local",
    price,
  });
  if (status !== 201) throw new Error(`Could not add a product: ${status}`);
  return body.data;
}

/** A project with one well, one section and a product; each test adds reports as it needs. */
async function setup(price: number | null = 10) {
  const project = await createProject();
  const well = await createWell(project.id);
  const section = await createSection(well.id);
  const product = await createProduct("Barite", {
    kind: "bulk",
    package_size: 25,
    package_unit: "kg",
    specific_gravity: 4.2,
  });
  const link = await addToProject(project.id, product.id, price);
  const report = (reportDate: string) =>
    createDailyReport(well.id, section.id, { report_date: reportDate });
  return { project, well, section, link, report };
}

const row = (reportId: string, projectProductId: string, extra = {}) => ({
  report_id: reportId,
  project_product_id: projectProductId,
  ...extra,
});

describe("POST /inventory", () => {
  test("adds a row with zero movements and the product of the project", async () => {
    const { link, report } = await setup();
    const day = await report("2026-03-01");

    const { status, body } = await call(
      "POST",
      "/inventory",
      row(day.id, link.id),
    );

    expect(status).toBe(201);
    expect(body.data).toMatchObject({
      report_id: day.id,
      project_product_id: link.id,
      unit_price: 10,
      initial_stock: 0,
      daily_received: 0,
      daily_used: 0,
      final_stock: 0,
      daily_cost: 0,
    });
    expect(body.data.product.name).toBe("Barite");
  });

  test("the next report starts from the final stock of the previous one", async () => {
    const { link, report } = await setup();
    const first = await report("2026-03-01");
    const second = await report("2026-03-02");
    await call(
      "POST",
      "/inventory",
      row(first.id, link.id, {
        initial: 10,
        received: 5,
        used: 3,
        returned: 1,
      }),
    );

    const { body } = await call("POST", "/inventory", row(second.id, link.id));

    expect(body.data.initial_stock).toBe(11);
  });

  test("an explicit initial stock wins over the carried one", async () => {
    const { link, report } = await setup();
    const first = await report("2026-03-01");
    const second = await report("2026-03-02");
    await call("POST", "/inventory", row(first.id, link.id, { initial: 10 }));

    const { body } = await call(
      "POST",
      "/inventory",
      row(second.id, link.id, { initial: 2 }),
    );

    expect(body.data.initial_stock).toBe(2);
  });

  test("rejects the same product twice in one report with 409", async () => {
    const { link, report } = await setup();
    const day = await report("2026-03-01");
    await call("POST", "/inventory", row(day.id, link.id));

    const { status, body } = await call(
      "POST",
      "/inventory",
      row(day.id, link.id),
    );

    expect(status).toBe(409);
    expect(body.code).toBe("INVENTORY_ROW_EXISTS");
  });

  test("rejects a product of another project with 409", async () => {
    const { report } = await setup();
    const day = await report("2026-03-01");
    const other = await createProject();
    const product = await createProduct("Salt");
    const foreign = await addToProject(other.id, product.id);

    const { status, body } = await call(
      "POST",
      "/inventory",
      row(day.id, foreign.id),
    );

    expect(status).toBe(409);
    expect(body.code).toBe("INVENTORY_PRODUCT_NOT_IN_PROJECT");
  });

  test("returns 404 for an unknown report or project product", async () => {
    const { link, report } = await setup();
    const day = await report("2026-03-01");

    const noReport = await call("POST", "/inventory", row(MISSING_ID, link.id));
    const noProduct = await call("POST", "/inventory", row(day.id, MISSING_ID));

    expect(noReport.status).toBe(404);
    expect(noProduct.status).toBe(404);
  });

  test("rejects negative and fractional numbers with 422", async () => {
    const { link, report } = await setup();
    const day = await report("2026-03-01");

    const { status, body } = await call(
      "POST",
      "/inventory",
      row(day.id, link.id, { used: -1, received: 1.5 }),
    );

    expect(status).toBe(422);
    expect(body.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("GET /inventory", () => {
  test("computes the monthly, cumulative, section and cost numbers", async () => {
    const { link, report } = await setup(10);
    const feb = await report("2026-02-28");
    const mar1 = await report("2026-03-01");
    const mar2 = await report("2026-03-02");
    await call(
      "POST",
      "/inventory",
      row(feb.id, link.id, { initial: 100, received: 10, used: 4 }),
    );
    await call(
      "POST",
      "/inventory",
      row(mar1.id, link.id, { received: 5, used: 2 }),
    );
    await call(
      "POST",
      "/inventory",
      row(mar2.id, link.id, { used: 3, returned: 1 }),
    );

    const { status, body } = await call(
      "GET",
      `/inventory?report_id=${mar2.id}`,
    );

    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({
      initial_stock: 109, // 100 + 10 - 4 = 106 after Feb, + 5 - 2 = 109 after Mar 1
      daily_used: 3,
      daily_returned: 1,
      section_used: 9,
      monthly_received: 5,
      monthly_used: 5,
      cumulative_received: 15,
      cumulative_used: 9,
      cumulative_returned: 1,
      final_stock: 105,
      daily_cost: 30,
    });
  });

  test("an earlier report does not see later movements", async () => {
    const { link, report } = await setup();
    const mar1 = await report("2026-03-01");
    const mar2 = await report("2026-03-02");
    await call("POST", "/inventory", row(mar1.id, link.id, { used: 1 }));
    await call("POST", "/inventory", row(mar2.id, link.id, { used: 5 }));

    const { body } = await call("GET", `/inventory?report_id=${mar1.id}`);

    expect(body.data[0].cumulative_used).toBe(1);
  });

  test("lists the rows of the report by product name", async () => {
    const { project, link, report } = await setup();
    const day = await report("2026-03-01");
    const apple = await addToProject(
      project.id,
      (await createProduct("Apple")).id,
    );
    await call("POST", "/inventory", row(day.id, link.id));
    await call("POST", "/inventory", row(day.id, apple.id));

    const { body } = await call("GET", `/inventory?report_id=${day.id}`);

    expect(
      body.data.map((r: { product: { name: string } }) => r.product.name),
    ).toEqual(["Apple", "Barite"]);
  });

  test("is empty for a report with no rows, and needs a report_id", async () => {
    const { report } = await setup();
    const day = await report("2026-03-01");

    const empty = await call("GET", `/inventory?report_id=${day.id}`);
    const missing = await call("GET", "/inventory");
    const unknown = await call("GET", `/inventory?report_id=${MISSING_ID}`);

    expect(empty.body.data).toEqual([]);
    expect(missing.status).toBe(422);
    expect(unknown.status).toBe(404);
  });
});

describe("PATCH /inventory/:id", () => {
  test("changes the movements and recomputes the numbers", async () => {
    const { link, report } = await setup();
    const day = await report("2026-03-01");
    const { body } = await call(
      "POST",
      "/inventory",
      row(day.id, link.id, { initial: 10 }),
    );

    const patched = await call("PATCH", `/inventory/${body.data.id}`, {
      used: 4,
    });

    expect(patched.status).toBe(200);
    expect(patched.body.data).toMatchObject({
      initial_stock: 10,
      daily_used: 4,
      final_stock: 6,
      daily_cost: 40,
    });
  });

  test("rejects an empty patch with 422 and an unknown id with 404", async () => {
    const { link, report } = await setup();
    const day = await report("2026-03-01");
    const { body } = await call("POST", "/inventory", row(day.id, link.id));

    const empty = await call("PATCH", `/inventory/${body.data.id}`, {});
    const unknown = await call("PATCH", `/inventory/${MISSING_ID}`, {
      used: 1,
    });

    expect(empty.status).toBe(422);
    expect(unknown.status).toBe(404);
  });
});

describe("DELETE /inventory/:id", () => {
  test("removes the row", async () => {
    const { link, report } = await setup();
    const day = await report("2026-03-01");
    const { body } = await call("POST", "/inventory", row(day.id, link.id));

    const deleted = await call("DELETE", `/inventory/${body.data.id}`);
    const list = await call("GET", `/inventory?report_id=${day.id}`);

    expect(deleted.status).toBe(204);
    expect(list.body.data).toEqual([]);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("DELETE", `/inventory/${MISSING_ID}`);

    expect(status).toBe(404);
  });
});

describe("rules of the other modules", () => {
  test("a product with inventory cannot be removed from its project (409)", async () => {
    const { link, report } = await setup();
    const day = await report("2026-03-01");
    await call("POST", "/inventory", row(day.id, link.id));

    const { status, body } = await call(
      "DELETE",
      `/project-products/${link.id}`,
    );

    expect(status).toBe(409);
    expect(body.code).toBe("PROJECT_PRODUCT_IN_USE");
  });

  test("a report with inventory rows cannot be deleted (409)", async () => {
    const { link, report } = await setup();
    const day = await report("2026-03-01");
    await call("POST", "/inventory", row(day.id, link.id));

    const { status, body } = await call("DELETE", `/daily-reports/${day.id}`);

    expect(status).toBe(409);
    expect(body.code).toBe("DAILY_REPORT_HAS_INVENTORY");
  });
});
