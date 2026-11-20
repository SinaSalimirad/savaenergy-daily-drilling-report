import { Elysia } from "elysia";
import {
  createProjectProductSchema,
  listProjectProductsQuerySchema,
  projectProductIdParamsSchema,
} from "./project-product.schemas";
import {
  createProjectProduct,
  deleteProjectProduct,
  listProjectProducts,
} from "./project-product.service";

// Routes only parse input and call the service. Rules live in the service.
// A project product is a link between a project and a catalog product: it is added and removed.
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
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteProjectProduct(params.id);
      return status(204, undefined);
    },
    { params: projectProductIdParamsSchema },
  );
