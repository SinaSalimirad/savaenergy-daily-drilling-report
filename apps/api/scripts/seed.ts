import { Pool } from "pg";
import {
  dailyReportCreateSchema,
  inventoryCreateSchema,
  productInputSchema,
  projectCreateSchema,
  projectProductCreateSchema,
  pumpCreateSchema,
  sceCreateSchema,
  sectionCreateSchema,
  wellCreateSchema,
} from "schema";

type SeedRow = Record<string, unknown> & { id: string };

type TableDefinition = {
  key: string;
  candidates: string[];
  rows: SeedRow[];
};

/**
 * Stable IDs make this seed repeatable and make it easy to refer to a project from local fixtures.
 * Change these two values before using the seed in a database that already contains these IDs.
 */
export const PROJECT_IDS = {
  project1: "20000000-0000-4000-8000-000000000001",
  project2: "20000000-0000-4000-8000-000000000002",
} as const;

const ID = {
  wells: [
    "30000000-0000-4000-8000-000000000001",
    "30000000-0000-4000-8000-000000000002",
    "30000000-0000-4000-8000-000000000003",
    "30000000-0000-4000-8000-000000000004",
  ],
  sections: [
    "40000000-0000-4000-8000-000000000001",
    "40000000-0000-4000-8000-000000000002",
    "40000000-0000-4000-8000-000000000003",
    "40000000-0000-4000-8000-000000000004",
    "40000000-0000-4000-8000-000000000005",
    "40000000-0000-4000-8000-000000000006",
    "40000000-0000-4000-8000-000000000007",
    "40000000-0000-4000-8000-000000000008",
    "40000000-0000-4000-8000-000000000009",
    "40000000-0000-4000-8000-000000000010",
  ],
  products: [
    "50000000-0000-4000-8000-000000000001",
    "50000000-0000-4000-8000-000000000002",
    "50000000-0000-4000-8000-000000000003",
    "50000000-0000-4000-8000-000000000004",
    "50000000-0000-4000-8000-000000000005",
    "50000000-0000-4000-8000-000000000006",
  ],
  projectProducts: [
    "60000000-0000-4000-8000-000000000001",
    "60000000-0000-4000-8000-000000000002",
    "60000000-0000-4000-8000-000000000003",
    "60000000-0000-4000-8000-000000000004",
    "60000000-0000-4000-8000-000000000005",
    "60000000-0000-4000-8000-000000000006",
    "60000000-0000-4000-8000-000000000007",
    "60000000-0000-4000-8000-000000000008",
    "60000000-0000-4000-8000-000000000009",
    "60000000-0000-4000-8000-000000000010",
    "60000000-0000-4000-8000-000000000011",
    "60000000-0000-4000-8000-000000000012",
  ],
  pumps: [
    "70000000-0000-4000-8000-000000000001",
    "70000000-0000-4000-8000-000000000002",
    "70000000-0000-4000-8000-000000000003",
    "70000000-0000-4000-8000-000000000004",
  ],
  solidControl: [
    "71000000-0000-4000-8000-000000000001",
    "71000000-0000-4000-8000-000000000002",
    "71000000-0000-4000-8000-000000000003",
    "71000000-0000-4000-8000-000000000004",
    "71000000-0000-4000-8000-000000000005",
    "71000000-0000-4000-8000-000000000006",
    "71000000-0000-4000-8000-000000000007",
    "71000000-0000-4000-8000-000000000008",
    "71000000-0000-4000-8000-000000000009",
    "71000000-0000-4000-8000-000000000010",
    "71000000-0000-4000-8000-000000000011",
    "71000000-0000-4000-8000-000000000012",
    "71000000-0000-4000-8000-000000000013",
    "71000000-0000-4000-8000-000000000014",
  ],
  reports: [
    "80000000-0000-4000-8000-000000000001",
    "80000000-0000-4000-8000-000000000002",
    "80000000-0000-4000-8000-000000000003",
    "80000000-0000-4000-8000-000000000004",
  ],
  inventory: [
    "90000000-0000-4000-8000-000000000001",
    "90000000-0000-4000-8000-000000000002",
    "90000000-0000-4000-8000-000000000003",
    "90000000-0000-4000-8000-000000000004",
    "90000000-0000-4000-8000-000000000005",
    "90000000-0000-4000-8000-000000000006",
    "90000000-0000-4000-8000-000000000007",
    "90000000-0000-4000-8000-000000000008",
    "90000000-0000-4000-8000-000000000009",
    "90000000-0000-4000-8000-000000000010",
    "90000000-0000-4000-8000-000000000011",
    "90000000-0000-4000-8000-000000000012",
  ],
} as const;

const projects: SeedRow[] = [
  {
    id: PROJECT_IDS.project1,
    name: "[DEMO] SAVA-001 — South Pars",
    operator: "Sava Energy",
    contractor: "Sava Energy Services",
    field: "South Pars (Demo)",
    wells: 2,
    currency: "USD",
    archived_at: null,
  },
  {
    id: PROJECT_IDS.project2,
    name: "[DEMO] SAVA-012 — North Yaran",
    operator: "Sava Energy",
    contractor: "Sava Energy Services",
    field: "North Yaran (Demo)",
    wells: 2,
    currency: "USD",
    archived_at: null,
  },
];

const products: SeedRow[] = [
  {
    id: ID.products[0],
    kind: "bulk",
    name: "Barite",
    package_size: 25,
    package_unit: "kg",
    specific_gravity: 4.2,
  },
  {
    id: ID.products[1],
    kind: "bulk",
    name: "Bentonite",
    package_size: 25,
    package_unit: "kg",
    specific_gravity: 2.6,
  },
  {
    id: ID.products[2],
    kind: "bulk",
    name: "PAC-LV",
    package_size: 25,
    package_unit: "kg",
    specific_gravity: 1.5,
  },
  {
    id: ID.products[3],
    kind: "bulk",
    name: "Soda Ash",
    package_size: 25,
    package_unit: "kg",
    specific_gravity: 2.5,
  },
  {
    id: ID.products[4],
    kind: "bulk",
    name: "Caustic Soda",
    package_size: 25,
    package_unit: "kg",
    specific_gravity: 2.13,
  },
  {
    id: ID.products[5],
    kind: "bulk",
    name: "Xanthan Gum",
    package_size: 25,
    package_unit: "kg",
    specific_gravity: 1.5,
  },
];

const wells: SeedRow[] = [
  {
    id: ID.wells[0],
    project_id: PROJECT_IDS.project1,
    name: "PYW-24ST1",
    status: "active",
    rig_name: "GPTK-G2",
    rig_type: "onshore",
    designation: "development",
    well_type: "directional",
    spud_date: "2026-11-01",
    water_depth: null,
  },
  {
    id: ID.wells[1],
    project_id: PROJECT_IDS.project1,
    name: "PYW-24ST2",
    status: "planned",
    rig_name: "GPTK-G2",
    rig_type: "onshore",
    designation: "development",
    well_type: "vertical",
    spud_date: null,
    water_depth: null,
  },
  {
    id: ID.wells[2],
    project_id: PROJECT_IDS.project2,
    name: "NY-01",
    status: "active",
    rig_name: "DEMO-RIG-03",
    rig_type: "onshore",
    designation: "exploration",
    well_type: "directional",
    spud_date: "2026-11-05",
    water_depth: null,
  },
  {
    id: ID.wells[3],
    project_id: PROJECT_IDS.project2,
    name: "NY-02",
    status: "planned",
    rig_name: "DEMO-RIG-03",
    rig_type: "onshore",
    designation: "exploration",
    well_type: "vertical",
    spud_date: null,
    water_depth: null,
  },
];

const sections: SeedRow[] = [
  {
    id: ID.sections[0],
    well_id: ID.wells[0],
    order: 1,
    hole_size: 17.5,
    hole_type: "conductor",
  },
  {
    id: ID.sections[1],
    well_id: ID.wells[0],
    order: 2,
    hole_size: 12.25,
    hole_type: "casing",
  },
  {
    id: ID.sections[2],
    well_id: ID.wells[0],
    order: 3,
    hole_size: 8.5,
    hole_type: "open_hole",
  },
  {
    id: ID.sections[3],
    well_id: ID.wells[1],
    order: 1,
    hole_size: 17.5,
    hole_type: "conductor",
  },
  {
    id: ID.sections[4],
    well_id: ID.wells[1],
    order: 2,
    hole_size: 12.25,
    hole_type: "casing",
  },
  {
    id: ID.sections[5],
    well_id: ID.wells[2],
    order: 1,
    hole_size: 17.5,
    hole_type: "conductor",
  },
  {
    id: ID.sections[6],
    well_id: ID.wells[2],
    order: 2,
    hole_size: 12.25,
    hole_type: "casing",
  },
  {
    id: ID.sections[7],
    well_id: ID.wells[2],
    order: 3,
    hole_size: 8.5,
    hole_type: "open_hole",
  },
  {
    id: ID.sections[8],
    well_id: ID.wells[3],
    order: 1,
    hole_size: 17.5,
    hole_type: "conductor",
  },
  {
    id: ID.sections[9],
    well_id: ID.wells[3],
    order: 2,
    hole_size: 12.25,
    hole_type: "casing",
  },
];

const projectProducts: SeedRow[] = [
  // SAVA-001 materials and unit prices in USD.
  {
    id: ID.projectProducts[0],
    project_id: PROJECT_IDS.project1,
    product_id: ID.products[0],
    origin: "foreign",
    price: 14.5,
  },
  {
    id: ID.projectProducts[1],
    project_id: PROJECT_IDS.project1,
    product_id: ID.products[1],
    origin: "local",
    price: 8.25,
  },
  {
    id: ID.projectProducts[2],
    project_id: PROJECT_IDS.project1,
    product_id: ID.products[2],
    origin: "foreign",
    price: 32.0,
  },
  {
    id: ID.projectProducts[3],
    project_id: PROJECT_IDS.project1,
    product_id: ID.products[3],
    origin: "local",
    price: 12.0,
  },
  {
    id: ID.projectProducts[4],
    project_id: PROJECT_IDS.project1,
    product_id: ID.products[4],
    origin: "local",
    price: 18.0,
  },
  {
    id: ID.projectProducts[5],
    project_id: PROJECT_IDS.project1,
    product_id: ID.products[5],
    origin: "foreign",
    price: 76.0,
  },
  // SAVA-012 materials and unit prices in USD.
  {
    id: ID.projectProducts[6],
    project_id: PROJECT_IDS.project2,
    product_id: ID.products[0],
    origin: "foreign",
    price: 15.0,
  },
  {
    id: ID.projectProducts[7],
    project_id: PROJECT_IDS.project2,
    product_id: ID.products[1],
    origin: "local",
    price: 8.5,
  },
  {
    id: ID.projectProducts[8],
    project_id: PROJECT_IDS.project2,
    product_id: ID.products[2],
    origin: "foreign",
    price: 33.0,
  },
  {
    id: ID.projectProducts[9],
    project_id: PROJECT_IDS.project2,
    product_id: ID.products[3],
    origin: "local",
    price: 12.5,
  },
  {
    id: ID.projectProducts[10],
    project_id: PROJECT_IDS.project2,
    product_id: ID.products[4],
    origin: "local",
    price: 18.5,
  },
  {
    id: ID.projectProducts[11],
    project_id: PROJECT_IDS.project2,
    product_id: ID.products[5],
    origin: "foreign",
    price: 78.0,
  },
];

const pumps: SeedRow[] = [
  {
    id: ID.pumps[0],
    project_id: PROJECT_IDS.project1,
    order: 1,
    model: "12-P-160",
    type: "triplex",
    rod_diameter: null,
    liner_diameter: 6,
    stroke_length: 12,
    efficiency: 95,
  },
  {
    id: ID.pumps[1],
    project_id: PROJECT_IDS.project1,
    order: 2,
    model: "14-P-220",
    type: "triplex",
    rod_diameter: null,
    liner_diameter: 6.5,
    stroke_length: 12,
    efficiency: 94.5,
  },
  {
    id: ID.pumps[2],
    project_id: PROJECT_IDS.project2,
    order: 1,
    model: "12-P-160",
    type: "triplex",
    rod_diameter: null,
    liner_diameter: 6,
    stroke_length: 12,
    efficiency: 95,
  },
  {
    id: ID.pumps[3],
    project_id: PROJECT_IDS.project2,
    order: 2,
    model: "14-P-220",
    type: "triplex",
    rod_diameter: null,
    liner_diameter: 6.5,
    stroke_length: 12,
    efficiency: 94.5,
  },
];

const solidControl: SeedRow[] = [
  // SAVA-001 equipment.
  {
    id: ID.solidControl[0],
    project_id: PROJECT_IDS.project1,
    order: 1,
    type: "shale_shaker",
    unit_no: 1,
    manufacturer: "NOV",
    model: "FLC 500",
    screen_size: "170/170/170/170",
  },
  {
    id: ID.solidControl[1],
    project_id: PROJECT_IDS.project1,
    order: 2,
    type: "shale_shaker",
    unit_no: 2,
    manufacturer: "NOV",
    model: "FLC 500",
    screen_size: "170/170/170/170",
  },
  {
    id: ID.solidControl[2],
    project_id: PROJECT_IDS.project1,
    order: 3,
    type: "desander",
    unit_no: 1,
    manufacturer: "SWACO",
    model: "MD-2",
    screen_size: null,
  },
  {
    id: ID.solidControl[3],
    project_id: PROJECT_IDS.project1,
    order: 4,
    type: "desilter",
    unit_no: 1,
    manufacturer: "SWACO",
    model: "MD-3",
    screen_size: null,
  },
  {
    id: ID.solidControl[4],
    project_id: PROJECT_IDS.project1,
    order: 5,
    type: "mud_cleaner",
    unit_no: 1,
    manufacturer: "NOV",
    model: "Mongoose",
    screen_size: "200/200/200",
  },
  {
    id: ID.solidControl[5],
    project_id: PROJECT_IDS.project1,
    order: 6,
    type: "centrifuge",
    unit_no: 1,
    manufacturer: "GN",
    model: "GNLW363",
    screen_size: null,
  },
  {
    id: ID.solidControl[6],
    project_id: PROJECT_IDS.project1,
    order: 7,
    type: "degasser",
    unit_no: 1,
    manufacturer: "NOV",
    model: "Poor Boy",
    screen_size: null,
  },
  // SAVA-012 equipment.
  {
    id: ID.solidControl[7],
    project_id: PROJECT_IDS.project2,
    order: 1,
    type: "shale_shaker",
    unit_no: 1,
    manufacturer: "NOV",
    model: "FLC 500",
    screen_size: "170/170/170/170",
  },
  {
    id: ID.solidControl[8],
    project_id: PROJECT_IDS.project2,
    order: 2,
    type: "shale_shaker",
    unit_no: 2,
    manufacturer: "NOV",
    model: "FLC 500",
    screen_size: "170/170/170/170",
  },
  {
    id: ID.solidControl[9],
    project_id: PROJECT_IDS.project2,
    order: 3,
    type: "desander",
    unit_no: 1,
    manufacturer: "SWACO",
    model: "MD-2",
    screen_size: null,
  },
  {
    id: ID.solidControl[10],
    project_id: PROJECT_IDS.project2,
    order: 4,
    type: "desilter",
    unit_no: 1,
    manufacturer: "SWACO",
    model: "MD-3",
    screen_size: null,
  },
  {
    id: ID.solidControl[11],
    project_id: PROJECT_IDS.project2,
    order: 5,
    type: "mud_cleaner",
    unit_no: 1,
    manufacturer: "NOV",
    model: "Mongoose",
    screen_size: "200/200/200",
  },
  {
    id: ID.solidControl[12],
    project_id: PROJECT_IDS.project2,
    order: 6,
    type: "centrifuge",
    unit_no: 1,
    manufacturer: "GN",
    model: "GNLW363",
    screen_size: null,
  },
  {
    id: ID.solidControl[13],
    project_id: PROJECT_IDS.project2,
    order: 7,
    type: "degasser",
    unit_no: 1,
    manufacturer: "NOV",
    model: "Poor Boy",
    screen_size: null,
  },
];

const dailyReports: SeedRow[] = [
  {
    id: ID.reports[0],
    well_id: ID.wells[0],
    section_id: ID.sections[2],
    report_no: 1,
    report_date: "2026-11-19",
    bit_depth_m: 2480.5,
    bit_td_m: 2480.5,
    bit_tvd_m: 2210.25,
  },
  {
    id: ID.reports[1],
    well_id: ID.wells[0],
    section_id: ID.sections[2],
    report_no: 2,
    report_date: "2026-11-20",
    bit_depth_m: 2512.75,
    bit_td_m: 2512.75,
    bit_tvd_m: 2235.8,
  },
  {
    id: ID.reports[2],
    well_id: ID.wells[2],
    section_id: ID.sections[7],
    report_no: 1,
    report_date: "2026-11-19",
    bit_depth_m: 1860.0,
    bit_td_m: 1860.0,
    bit_tvd_m: 1642.3,
  },
  {
    id: ID.reports[3],
    well_id: ID.wells[2],
    section_id: ID.sections[7],
    report_no: 2,
    report_date: "2026-11-20",
    bit_depth_m: 1894.5,
    bit_td_m: 1894.5,
    bit_tvd_m: 1671.6,
  },
];

const inventory: SeedRow[] = [
  // SAVA-001 / PYW-24ST1. Quantities are bags/packages, not kilograms.
  {
    id: ID.inventory[0],
    report_id: ID.reports[0],
    project_product_id: ID.projectProducts[0],
    initial: 100,
    received: 20,
    used: 8,
    returned: 0,
  },
  {
    id: ID.inventory[1],
    report_id: ID.reports[0],
    project_product_id: ID.projectProducts[1],
    initial: 40,
    received: 0,
    used: 2,
    returned: 0,
  },
  {
    id: ID.inventory[2],
    report_id: ID.reports[0],
    project_product_id: ID.projectProducts[2],
    initial: 15,
    received: 10,
    used: 1,
    returned: 0,
  },
  {
    id: ID.inventory[3],
    report_id: ID.reports[1],
    project_product_id: ID.projectProducts[0],
    initial: 112,
    received: 0,
    used: 10,
    returned: 0,
  },
  {
    id: ID.inventory[4],
    report_id: ID.reports[1],
    project_product_id: ID.projectProducts[1],
    initial: 38,
    received: 0,
    used: 3,
    returned: 0,
  },
  {
    id: ID.inventory[5],
    report_id: ID.reports[1],
    project_product_id: ID.projectProducts[2],
    initial: 24,
    received: 0,
    used: 2,
    returned: 0,
  },
  // SAVA-012 / NY-01.
  {
    id: ID.inventory[6],
    report_id: ID.reports[2],
    project_product_id: ID.projectProducts[6],
    initial: 80,
    received: 15,
    used: 7,
    returned: 0,
  },
  {
    id: ID.inventory[7],
    report_id: ID.reports[2],
    project_product_id: ID.projectProducts[7],
    initial: 35,
    received: 0,
    used: 2,
    returned: 0,
  },
  {
    id: ID.inventory[8],
    report_id: ID.reports[2],
    project_product_id: ID.projectProducts[8],
    initial: 12,
    received: 8,
    used: 1,
    returned: 0,
  },
  {
    id: ID.inventory[9],
    report_id: ID.reports[3],
    project_product_id: ID.projectProducts[6],
    initial: 88,
    received: 0,
    used: 9,
    returned: 0,
  },
  {
    id: ID.inventory[10],
    report_id: ID.reports[3],
    project_product_id: ID.projectProducts[7],
    initial: 33,
    received: 0,
    used: 2,
    returned: 0,
  },
  {
    id: ID.inventory[11],
    report_id: ID.reports[3],
    project_product_id: ID.projectProducts[8],
    initial: 19,
    received: 0,
    used: 2,
    returned: 0,
  },
];

function validateSeedData() {
  const validationGroups = [
    ["projects", projectCreateSchema, projects],
    ["products", productInputSchema, products],
    ["wells", wellCreateSchema, wells],
    ["sections", sectionCreateSchema, sections],
    ["project products", projectProductCreateSchema, projectProducts],
    ["pumps", pumpCreateSchema, pumps],
    ["solid control equipment", sceCreateSchema, solidControl],
    ["daily reports", dailyReportCreateSchema, dailyReports],
    ["inventory", inventoryCreateSchema, inventory],
  ] as const;

  for (const [groupName, schema, rows] of validationGroups) {
    for (const row of rows) {
      const result = schema.safeParse(row);
      if (!result.success) {
        throw new Error(
          `Invalid ${groupName} seed row ${row.id}: ${result.error.message}`,
        );
      }
    }
  }
}

function validateRelationships() {
  for (const project of projects) {
    const projectWells = wells.filter((well) => well.project_id === project.id);
    if (projectWells.length !== Number(project.wells)) {
      throw new Error(
        `Project ${project.id} declares ${project.wells} wells but has ${projectWells.length} seed wells.`,
      );
    }
  }

  for (const section of sections) {
    if (!wells.some((well) => well.id === section.well_id)) {
      throw new Error(`Section ${section.id} references an unknown well.`);
    }
  }

  for (const report of dailyReports) {
    const section = sections.find((item) => item.id === report.section_id);
    if (!section || section.well_id !== report.well_id) {
      throw new Error(
        `Daily report ${report.id} must reference a section belonging to its well.`,
      );
    }
  }

  for (const row of inventory) {
    const report = dailyReports.find((item) => item.id === row.report_id);
    const reportWell = wells.find((well) => well.id === report?.well_id);
    const projectProduct = projectProducts.find(
      (item) => item.id === row.project_product_id,
    );
    if (!report || !reportWell || !projectProduct) {
      throw new Error(`Inventory row ${row.id} has a missing parent record.`);
    }
    if (reportWell.project_id !== projectProduct.project_id) {
      throw new Error(
        `Inventory row ${row.id} connects a report and product from different projects.`,
      );
    }
  }
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function loadTableCatalog(client: import("pg").PoolClient) {
  const result = await client.query<{
    table_schema: string;
    table_name: string;
  }>(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema = ANY(current_schemas(false))
      AND table_type = 'BASE TABLE'
  `);
  return result.rows;
}

async function resolveTable(
  client: import("pg").PoolClient,
  catalog: { table_schema: string; table_name: string }[],
  definition: TableDefinition,
) {
  const match = definition.candidates
    .map((candidate) => catalog.find((table) => table.table_name === candidate))
    .find((table) => table !== undefined);

  if (!match) {
    throw new Error(
      `Could not find the table for "${definition.key}". Tried: ${definition.candidates.join(", ")}. Check the API Drizzle schema/migrations.`,
    );
  }

  const columnsResult = await client.query<{ column_name: string }>(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
    `,
    [match.table_schema, match.table_name],
  );

  return {
    schema: match.table_schema,
    name: match.table_name,
    columns: new Set(columnsResult.rows.map((row) => row.column_name)),
  };
}

async function insertRows(
  client: import("pg").PoolClient,
  table: Awaited<ReturnType<typeof resolveTable>>,
  sourceRows: SeedRow[],
) {
  const timestamp = new Date();

  for (const sourceRow of sourceRows) {
    const row: Record<string, unknown> = { ...sourceRow };

    if (table.columns.has("created_at") && !("created_at" in row)) {
      row.created_at = timestamp;
    }
    if (table.columns.has("updated_at") && !("updated_at" in row)) {
      row.updated_at = timestamp;
    }

    const missingColumns = Object.keys(row).filter(
      (column) => !table.columns.has(column),
    );
    if (missingColumns.length > 0) {
      throw new Error(
        `Table ${table.schema}.${table.name} is missing expected columns: ${missingColumns.join(", ")}`,
      );
    }
    if (!table.columns.has("id")) {
      throw new Error(`Table ${table.schema}.${table.name} has no id column.`);
    }

    const columns = Object.keys(row);
    const values = columns.map((column) => row[column]);
    const placeholders = columns.map((_, index) => `$${index + 1}`);
    const updates = columns
      .filter((column) => column !== "id")
      .map(
        (column) =>
          `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`,
      );

    const sql = `
      INSERT INTO ${quoteIdentifier(table.schema)}.${quoteIdentifier(table.name)}
        (${columns.map(quoteIdentifier).join(", ")})
      VALUES (${placeholders.join(", ")})
      ON CONFLICT (${quoteIdentifier("id")})
      DO UPDATE SET ${updates.join(", ")}
    `;

    await client.query(sql, values);
  }
}

async function main() {
  validateSeedData();
  validateRelationships();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Run this command from apps/api or load the API .env file.",
    );
  }

  const pool = new Pool({ connectionString, max: 1 });
  const client = await pool.connect();

  const definitions: TableDefinition[] = [
    { key: "projects", candidates: ["projects"], rows: projects },
    { key: "products", candidates: ["product", "products"], rows: products },
    { key: "wells", candidates: ["wells"], rows: wells },
    {
      key: "project products",
      candidates: ["project_product", "project_products"],
      rows: projectProducts,
    },
    { key: "sections", candidates: ["sections"], rows: sections },
    { key: "pumps", candidates: ["pumps"], rows: pumps },
    {
      key: "solid control equipment",
      candidates: [
        "solid_control_equipment",
        "solid_control",
        "solids_control",
      ],
      rows: solidControl,
    },
    {
      key: "daily reports",
      candidates: ["daily_report", "daily_reports"],
      rows: dailyReports,
    },
    {
      key: "inventory",
      candidates: ["product_inventory", "inventory"],
      rows: inventory,
    },
  ];

  try {
    const catalog = await loadTableCatalog(client);
    const resolvedTables = new Map<
      string,
      Awaited<ReturnType<typeof resolveTable>>
    >();

    // Resolve and check every table/column name before opening the transaction.
    for (const definition of definitions) {
      const table = await resolveTable(client, catalog, definition);
      resolvedTables.set(definition.key, table);

      const expectedColumns = new Set(
        definition.rows.flatMap((row) => Object.keys(row)),
      );
      const missingColumns = [...expectedColumns].filter(
        (column) => !table.columns.has(column),
      );
      if (missingColumns.length > 0) {
        throw new Error(
          `Table ${table.schema}.${table.name} does not match the seed data. Missing: ${missingColumns.join(", ")}`,
        );
      }
    }

    await client.query("BEGIN");

    for (const definition of definitions) {
      const table = resolvedTables.get(definition.key);
      if (!table) throw new Error(`Unresolved table: ${definition.key}`);
      await insertRows(client, table, definition.rows);
      console.log(`✓ ${definition.key}: ${definition.rows.length} rows`);
    }

    await client.query("COMMIT");
    console.log("\nSeed completed successfully.");
    console.log(`Project 1 ID: ${PROJECT_IDS.project1}`);
    console.log(`Project 2 ID: ${PROJECT_IDS.project2}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
