import { beforeEach, describe, expect, test } from "bun:test";
import { call, createProject, MISSING_ID, resetDb } from "../../test/helpers";

beforeEach(resetDb);

async function createProduct(name = "Barite") {
  const { status, body } = await call("POST", "/products", {
    kind: "equipment",
    name,
  });
  if (status !== 201) throw new Error(`Could not create a product: ${status}`);
  return body.data;
}

const link = (projectId: string, productId: string, extra = {}) => ({
  project_id: projectId,
  product_id: productId,
  origin: "local",
  ...extra,
});

describe("POST /project-products", () => {
  test("adds a product to a project and returns it with the product", async () => {
    const project = await createProject();
    const product = await createProduct("Barite");

    const { status, body } = await call(
      "POST",
      "/project-products",
      link(project.id, product.id, { price: 12.5 }),
    );

    expect(status).toBe(201);
    expect(body.data).toMatchObject({
      project_id: project.id,
      product_id: product.id,
      origin: "local",
      price: 12.5,
    });
    expect(body.data.product.name).toBe("Barite");
    expect(body.data).not.toHaveProperty("created_by");
  });

  test("the price is optional", async () => {
    const project = await createProject();
    const product = await createProduct();

    const { status, body } = await call(
      "POST",
      "/project-products",
      link(project.id, product.id),
    );

    expect(status).toBe(201);
    expect(body.data.price).toBeNull();
  });

  test("rejects the same product twice in one project with 409", async () => {
    const project = await createProject();
    const product = await createProduct();
    await call("POST", "/project-products", link(project.id, product.id));

    const { status, body } = await call(
      "POST",
      "/project-products",
      link(project.id, product.id),
    );

    expect(status).toBe(409);
    expect(body.code).toBe("PROJECT_PRODUCT_EXISTS");
  });

  test("the same product can be used by two projects", async () => {
    const [a, b] = [await createProject(), await createProject()];
    const product = await createProduct();
    await call("POST", "/project-products", link(a.id, product.id));

    const { status } = await call(
      "POST",
      "/project-products",
      link(b.id, product.id),
    );

    expect(status).toBe(201);
  });

  test("returns 404 for an unknown project or product", async () => {
    const project = await createProject();
    const product = await createProduct();

    const noProject = await call(
      "POST",
      "/project-products",
      link(MISSING_ID, product.id),
    );
    const noProduct = await call(
      "POST",
      "/project-products",
      link(project.id, MISSING_ID),
    );

    expect(noProject.status).toBe(404);
    expect(noProject.body.message).toBe("Project was not found.");
    expect(noProduct.status).toBe(404);
    expect(noProduct.body.message).toBe("Product was not found.");
  });

  test("rejects a bad origin and a price of 0 with 422", async () => {
    const project = await createProject();
    const product = await createProduct();

    const { status, body } = await call(
      "POST",
      "/project-products",
      link(project.id, product.id, { origin: "mars", price: 0 }),
    );

    expect(status).toBe(422);
    expect(body.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("GET /project-products", () => {
  test("lists only the products of the given project, by name", async () => {
    const [a, b] = [await createProject(), await createProject()];
    const [zinc, barite] = [
      await createProduct("Zinc"),
      await createProduct("Barite"),
    ];
    await call("POST", "/project-products", link(a.id, zinc.id));
    await call("POST", "/project-products", link(a.id, barite.id));
    await call("POST", "/project-products", link(b.id, zinc.id));

    const { status, body } = await call(
      "GET",
      `/project-products?project_id=${a.id}`,
    );

    expect(status).toBe(200);
    expect(
      body.data.map((row: { product: { name: string } }) => row.product.name),
    ).toEqual(["Barite", "Zinc"]);
    expect(body.meta.total).toBe(2);
  });
});

describe("DELETE /project-products/:id", () => {
  test("removes the product from the project but keeps it in the catalog", async () => {
    const project = await createProject();
    const product = await createProduct();
    const { body } = await call(
      "POST",
      "/project-products",
      link(project.id, product.id),
    );

    const deleted = await call("DELETE", `/project-products/${body.data.id}`);
    const list = await call(
      "GET",
      `/project-products?project_id=${project.id}`,
    );
    const catalog = await call("GET", `/products/${product.id}`);

    expect(deleted.status).toBe(204);
    expect(list.body.data).toEqual([]);
    expect(catalog.status).toBe(200);
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("DELETE", `/project-products/${MISSING_ID}`);

    expect(status).toBe(404);
  });
});

describe("DELETE /projects/:id with products", () => {
  test("is refused with 409 PROJECT_HAS_PRODUCTS", async () => {
    const project = await createProject();
    const product = await createProduct();
    await call("POST", "/project-products", link(project.id, product.id));

    const { status, body } = await call("DELETE", `/projects/${project.id}`);

    expect(status).toBe(409);
    expect(body.code).toBe("PROJECT_HAS_PRODUCTS");
  });
});

describe("GET /project-products paging", () => {
  test("pages the products of a project with the right total", async () => {
    const project = await createProject();
    for (const name of ["A", "B", "C"]) {
      const product = await createProduct(name);
      await call("POST", "/project-products", link(project.id, product.id));
    }

    const { body } = await call(
      "GET",
      `/project-products?project_id=${project.id}&page=2&pageSize=2`,
    );

    expect(body.data).toHaveLength(1);
    expect(body.meta).toEqual({ page: 2, pageSize: 2, total: 3 });
  });

  test("an unknown project has no products, and a bad id is a 422", async () => {
    const empty = await call(
      "GET",
      `/project-products?project_id=${MISSING_ID}`,
    );
    const bad = await call("GET", "/project-products?project_id=abc");

    expect(empty.body.data).toEqual([]);
    expect(bad.status).toBe(422);
  });
});

describe("PATCH /project-products/:id", () => {
  async function addOne(price: number | null = 10) {
    const project = await createProject();
    const product = await createProduct();
    const { body } = await call(
      "POST",
      "/project-products",
      link(project.id, product.id, { price, origin: "local" }),
    );
    return { project, product, row: body.data };
  }

  test("changes the origin and the price", async () => {
    const { row } = await addOne();

    const { status, body } = await call(
      "PATCH",
      `/project-products/${row.id}`,
      {
        origin: "foreign",
        price: 99.5,
      },
    );

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      id: row.id,
      origin: "foreign",
      price: 99.5,
    });
    expect(body.data.product.name).toBe(row.product.name);
  });

  test("changing one field keeps the other", async () => {
    const { row } = await addOne(10);

    const { body } = await call("PATCH", `/project-products/${row.id}`, {
      origin: "foreign",
    });

    expect(body.data).toMatchObject({ origin: "foreign", price: 10 });
  });

  test("null removes the price", async () => {
    const { row } = await addOne(10);

    const { body } = await call("PATCH", `/project-products/${row.id}`, {
      price: null,
    });

    expect(body.data.price).toBeNull();
  });

  test("never moves the link to another project or product", async () => {
    const { project, product, row } = await addOne();
    const other = await createProject();

    const { body } = await call("PATCH", `/project-products/${row.id}`, {
      origin: "foreign",
      project_id: other.id,
    });

    expect(body.data.project_id).toBe(project.id);
    expect(body.data.product_id).toBe(product.id);
  });

  test("rejects an empty patch, a bad origin and a price of 0 with 422", async () => {
    const { row } = await addOne();

    for (const patch of [{}, { origin: "mars" }, { price: 0 }]) {
      const { status } = await call(
        "PATCH",
        `/project-products/${row.id}`,
        patch,
      );
      expect(status).toBe(422);
    }
  });

  test("returns 404 for an unknown id", async () => {
    const { status } = await call("PATCH", `/project-products/${MISSING_ID}`, {
      origin: "local",
    });

    expect(status).toBe(404);
  });
});
