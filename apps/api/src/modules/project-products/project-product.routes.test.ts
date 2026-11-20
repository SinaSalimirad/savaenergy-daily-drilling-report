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
