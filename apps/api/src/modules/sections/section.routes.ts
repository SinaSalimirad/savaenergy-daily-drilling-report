import { Elysia } from "elysia";
import {
  createSectionSchema,
  listSectionsQuerySchema,
  moveSectionSchema,
  sectionIdParamsSchema,
  updateSectionSchema,
} from "./section.schemas";
import {
  createSection,
  deleteSection,
  getSection,
  listSections,
  moveSection,
  updateSection,
} from "./section.service";

// Routes only parse input and call the service. Rules live in the service.
// Sections have no archive: they are deleted with `DELETE`.
export const sectionRoutes = new Elysia({ prefix: "/sections" })
  .get(
    "/",
    async ({ query }) => {
      const { items, meta } = await listSections(query);
      return { data: items, meta };
    },
    { query: listSectionsQuerySchema },
  )
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createSection(body) }),
    { body: createSectionSchema },
  )
  .get("/:id", async ({ params }) => ({ data: await getSection(params.id) }), {
    params: sectionIdParamsSchema,
  })
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateSection(params.id, body),
    }),
    { params: sectionIdParamsSchema, body: updateSectionSchema },
  )
  .post(
    "/:id/move",
    async ({ params, body }) => ({ data: await moveSection(params.id, body) }),
    { params: sectionIdParamsSchema, body: moveSectionSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteSection(params.id);
      return status(204, undefined);
    },
    { params: sectionIdParamsSchema },
  );
