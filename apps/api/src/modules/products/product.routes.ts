import { Elysia } from "elysia";
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamsSchema,
  updateProductSchema,
} from "./product.schemas";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "./product.service";

// Routes only parse input and call the service. Rules live in the service.
// Products have no archive: they are deleted with `DELETE`, unless a project uses them.
export const productRoutes = new Elysia({ prefix: "/products" })
  .get(
    "/",
    async ({ query }) => {
      const { items, meta } = await listProducts(query);
      return { data: items, meta };
    },
    { query: listProductsQuerySchema },
  )
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createProduct(body) }),
    { body: createProductSchema },
  )
  .get("/:id", async ({ params }) => ({ data: await getProduct(params.id) }), {
    params: productIdParamsSchema,
  })
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateProduct(params.id, body),
    }),
    { params: productIdParamsSchema, body: updateProductSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteProduct(params.id);
      return status(204, undefined);
    },
    { params: productIdParamsSchema },
  );
