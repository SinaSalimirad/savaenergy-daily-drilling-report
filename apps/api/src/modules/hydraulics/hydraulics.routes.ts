import { Elysia } from "elysia";
import {
  hydraulicsQuerySchema,
  setHydraulicInputSchema,
} from "./hydraulics.schemas";
import {
  getHoleCleaning,
  getHydraulicInput,
  getPressureLoss,
  setHydraulicInput,
} from "./hydraulics.service";

// Routes only parse input and call the service. Rules live in the service.
// The pressure loss and the hole cleaning are computed on every request from the other pages
// of the report (geometry, string, bit, rheology, mud sample) and the inputs saved here.
export const hydraulicsRoutes = new Elysia({ prefix: "/hydraulics" })
  .get(
    "/inputs",
    async ({ query }) => ({ data: await getHydraulicInput(query) }),
    {
      query: hydraulicsQuerySchema,
    },
  )
  .put(
    "/inputs",
    async ({ body }) => ({ data: await setHydraulicInput(body) }),
    {
      body: setHydraulicInputSchema,
    },
  )
  .get(
    "/pressure-loss",
    async ({ query }) => ({ data: await getPressureLoss(query) }),
    {
      query: hydraulicsQuerySchema,
    },
  )
  .get(
    "/hole-cleaning",
    async ({ query }) => ({ data: await getHoleCleaning(query) }),
    {
      query: hydraulicsQuerySchema,
    },
  );
