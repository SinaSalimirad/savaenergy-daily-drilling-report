import { Elysia } from "elysia";
import {
  createProjectProductSchema,
  listProjectProductsQuerySchema,
  projectProductIdParamsSchema,
  updateProjectProductSchema,
} from "./project-product.schemas";
import {
  createProjectProduct,
  deleteProjectProduct,
  listProjectProducts,
  updateProjectProduct,
} from "./project-product.service";

// Routes only parse input and call the service. Rules live in the service.
// A project product is a link between a project and a catalog product: it is added, edited (origin and price) and removed.
export const projectProductRoutes = new Elysia({ prefix: "/project-products" })
  .get(
    "/",
    async ({ query }) => {
      const { items, meta } = await listProjectProducts(query);
      return { data: items, meta };
    },
    { query: listProjectProductsQuerySchema },
  )
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createProjectProduct(body) }),
    { body: createProjectProductSchema },
  )
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateProjectProduct(params.id, body),
    }),
    { params: projectProductIdParamsSchema, body: updateProjectProductSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteProjectProduct(params.id);
      return status(204, undefined);
    },
    { params: projectProductIdParamsSchema },
  );
