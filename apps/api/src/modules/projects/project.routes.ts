import { Elysia } from "elysia";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  projectIdParamsSchema,
  updateProjectSchema,
} from "./project.schemas";
import {
  archiveProject,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  restoreProject,
  updateProject,
} from "./project.service";

// Routes only parse input and call the service. Rules live in the service.
export const projectRoutes = new Elysia({ prefix: "/projects" })
  .get(
    "/",
    async ({ query }) => {
      const { items, meta } = await listProjects(query);
      return { data: items, meta };
    },
    { query: listProjectsQuerySchema },
  )
  .post(
    "/",
    async ({ body, status }) =>
      status(201, { data: await createProject(body) }),
    { body: createProjectSchema },
  )
  .get("/:id", async ({ params }) => ({ data: await getProject(params.id) }), {
    params: projectIdParamsSchema,
  })
  .patch(
    "/:id",
    async ({ params, body }) => ({
      data: await updateProject(params.id, body),
    }),
    { params: projectIdParamsSchema, body: updateProjectSchema },
  )
  .post(
    "/:id/archive",
    async ({ params }) => ({ data: await archiveProject(params.id) }),
    { params: projectIdParamsSchema },
  )
  .post(
    "/:id/restore",
    async ({ params }) => ({ data: await restoreProject(params.id) }),
    { params: projectIdParamsSchema },
  )
  .delete(
    "/:id",
    async ({ params, status }) => {
      await deleteProject(params.id);
      // 204 No Content: the delete worked and there is nothing to send back.
      return status(204, undefined);
    },
    { params: projectIdParamsSchema },
  );
