import { Elysia } from "elysia";
import {
  setMudLossSchema,
  setVolumeAccountingSchema,
  volumeSheetQuerySchema,
} from "./volume.schemas";
import {
  getVolumeSheet,
  setMudLosses,
  setVolumeAccounting,
} from "./volume.service";

// Routes only parse input and call the service. Rules live in the service.
// Both pages read the same sheet: the volumes of one report, with the totals of its section and
// its well. Each `PUT` saves one page's values and returns the sheet again.
export const volumeRoutes = new Elysia({ prefix: "/volumes" })
  .get("/", async ({ query }) => ({ data: await getVolumeSheet(query) }), {
    query: volumeSheetQuerySchema,
  })
  .put(
    "/accounting",
    async ({ body }) => ({ data: await setVolumeAccounting(body) }),
    { body: setVolumeAccountingSchema },
  )
  .put("/losses", async ({ body }) => ({ data: await setMudLosses(body) }), {
    body: setMudLossSchema,
  });
