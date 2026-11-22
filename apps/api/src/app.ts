import { cors } from "@elysiajs/cors";
import { elysiaLogger } from "@logtape/elysia";
import { Elysia } from "elysia";
import { env } from "./config/env";
import { errorHandler } from "./lib/error-handler";
import "./lib/logger";
import { dailyReportRoutes } from "./modules/daily-reports/daily-report.routes";
import { inventoryRoutes } from "./modules/inventory/inventory.routes";
import { mudSampleRoutes } from "./modules/mud-samples/mud-sample.routes";
import { pitReadingRoutes } from "./modules/pit-readings/pit-reading.routes";
import { pitRoutes } from "./modules/pits/pit.routes";
import { productRoutes } from "./modules/products/product.routes";
import { projectProductRoutes } from "./modules/project-products/project-product.routes";
import { projectRoutes } from "./modules/projects/project.routes";
import { pumpRoutes } from "./modules/pumps/pump.routes";
import { rheologyRoutes } from "./modules/rheology/rheology.routes";
import { saltTableRoutes } from "./modules/salt-tables/salt-table.routes";
import { sectionRoutes } from "./modules/sections/section.routes";
import { solidControlRoutes } from "./modules/solid-control/solid-control.routes";
import { solidsAnalysisRoutes } from "./modules/solids-analysis/solids-analysis.routes";
import { wellRoutes } from "./modules/wells/well.routes";

// App is built separately from the server start, so it can be used without opening a port.
export const app = new Elysia()
  // One line per request. It goes under the "api" category, so LOG_LEVEL applies to it too.
  .use(
    elysiaLogger({
      category: ["api", "http"],
      skip: (ctx) => ctx.path === "/health",
      // Adds `requestId` to the request line and to every log written while handling it.
      // A caller can send its own `x-request-id` header; the same id comes back in the response.
      context: true,
      // A 404 or 422 is the client's mistake, not a server problem, so it is not an error.
      completionLevel: (_ctx, { status }) =>
        status >= 500 ? "error" : status >= 400 ? "warning" : "info",
    }),
  )
  // The web app runs only in the browser, so it calls the API cross-origin.
  .use(cors({ origin: env.WEB_ORIGIN }))
  .use(errorHandler)
  .get("/health", () => ({
    data: { status: "ok" },
  }))
  .use(projectRoutes)
  .use(wellRoutes)
  .use(sectionRoutes)
  .use(dailyReportRoutes)
  .use(productRoutes)
  .use(projectProductRoutes)
  .use(inventoryRoutes)
  .use(pumpRoutes)
  .use(pitRoutes)
  .use(pitReadingRoutes)
  .use(saltTableRoutes)
  .use(mudSampleRoutes)
  .use(rheologyRoutes)
  .use(solidsAnalysisRoutes)
  .use(solidControlRoutes);

// The web app imports only this type (never the runtime code) so Eden can infer every route.
export type App = typeof app;
