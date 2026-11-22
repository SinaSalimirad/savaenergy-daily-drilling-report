import { Pool } from "pg";
import {
  bitCreateSchema,
  dailyReportCreateSchema,
  drillStringToolCreateSchema,
  hydraulicInputSetSchema,
  inventoryCreateSchema,
  mudSampleCreateSchema,
  pitCreateSchema,
  pitReadingCreateSchema,
  productInputSchema,
  projectCreateSchema,
  projectProductCreateSchema,
  pumpCreateSchema,
  rheologyCreateSchema,
  sceCreateSchema,
  sectionCreateSchema,
  solidsAnalysisCreateSchema,
  surveyStationCreateSchema,
  wellboreIntervalCreateSchema,
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

/** `count` stable IDs with the same prefix, like the lists in `ID` but shorter to write. */
const makeIds = (prefix: string, count: number) =>
  Array.from(
    { length: count },
    (_, index) =>
      `${prefix.padEnd(8, "0")}-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  );

const FLUID_ID = {
  pits: makeIds("a", 10),
  pitReadings: makeIds("a1", 20),
  mudSamples: makeIds("b", 8),
  rheology: makeIds("b1", 8),
  solids: makeIds("b2", 8),
};

// Mud pits of the two projects: the first 6 belong to project 1, the last 4 to project 2.
const PITS: [string, "active" | "reserve" | "not mud", number, string][] = [
  ["Suction 1", "active", 480, PROJECT_IDS.project1],
  ["Suction 2", "active", 480, PROJECT_IDS.project1],
  ["Middle", "active", 480, PROJECT_IDS.project1],
  ["Reserve 1", "reserve", 210, PROJECT_IDS.project1],
  ["Reserve 2", "reserve", 140, PROJECT_IDS.project1],
  ["Trip Tank", "not mud", 100, PROJECT_IDS.project1],
  ["Active 1", "active", 400, PROJECT_IDS.project2],
  ["Active 2", "active", 400, PROJECT_IDS.project2],
  ["Reserve 1", "reserve", 250, PROJECT_IDS.project2],
  ["Trip Tank", "not mud", 80, PROJECT_IDS.project2],
];

const pits: SeedRow[] = PITS.map(
  ([name, type, capacity, project_id], index) => ({
    id: FLUID_ID.pits[index] as string,
    project_id,
    // The position inside the project: the pits of project 2 start again at 1.
    order:
      PITS.slice(0, index).filter((pit) => pit[3] === project_id).length + 1,
    name,
    type,
    capacity,
  }),
);

// [report, pit, volume (bbl), mud weight (pcf), mud type]. Project 1 mixes salt saturated
// mud; project 2 drills with a water-based mud.
const PIT_READINGS: [number, number, number, number | null, string | null][] = [
  [0, 0, 267, 130, "Salt Saturate Mud"],
  [0, 1, 230, 130, "Salt Saturate Mud"],
  [0, 2, 20, 130, "Salt Saturate Mud"],
  [0, 3, 106, 102, "Salt Mud"],
  [0, 4, 100, 75, "NaCl Brine"],
  [0, 5, 18, null, null],
  [1, 0, 281, 130, "Salt Saturate Mud"],
  [1, 1, 215, 130, "Salt Saturate Mud"],
  [1, 2, 24, 130, "Salt Saturate Mud"],
  [1, 3, 98, 102, "Salt Mud"],
  [1, 4, 100, 75, "NaCl Brine"],
  [1, 5, 15, null, null],
  [2, 6, 310, 78, "Bentonite Mud"],
  [2, 7, 290, 78, "Bentonite Mud"],
  [2, 8, 180, 75, "Bentonite Mud"],
  [2, 9, 12, null, null],
  [3, 6, 322, 79, "Bentonite Mud"],
  [3, 7, 276, 79, "Bentonite Mud"],
  [3, 8, 180, 75, "Bentonite Mud"],
  [3, 9, 10, null, null],
];

const pitReadings: SeedRow[] = PIT_READINGS.map(
  ([report, pit, volume, mud_weight, mud_type], index) => ({
    id: FLUID_ID.pitReadings[index] as string,
    report_id: ID.reports[report] as string,
    pit_id: FLUID_ID.pits[pit] as string,
    volume,
    mud_weight,
    mud_type,
  }),
);

// Two samples per report, taken at 08:30 and 16:00. Project 1 (reports 0 and 1) has a salt
// saturated mud, project 2 (reports 2 and 3) a bentonite mud.
const SAMPLE_TIMES = ["08:30", "16:00"];
const sampleKey = (index: number) => ({
  report_id: ID.reports[Math.floor(index / 2)] as string,
  sample_no: (index % 2) + 1,
  sample_time: SAMPLE_TIMES[index % 2] as string,
});

const MUD_SAMPLES: Record<string, unknown>[] = [
  {
    sample_from: "Active",
    flowline_temp_f: 118,
    depth_m: 2480.5,
    tvd_m: 2210.25,
    mud_weight_pcf: 130,
    mud_temp_f: 120,
    funnel_viscosity: 41,
    api_filtrate_cc: 3.2,
    api_cake: 1,
    oil_percent: 0,
    water_percent: 63,
    solids_percent: 37,
    sand_percent: 0.25,
    mbt_lb_bbl: 2.5,
    ph: 9.6,
    ph_temp_f: 120,
    alkalinity_mud_ml: 0.5,
    pf_ml: 0.4,
    mf_ml: 0.9,
    chloride_mg_l: 177000,
    total_hardness_mg_l: 840,
  },
  {
    sample_from: "Active",
    flowline_temp_f: 121,
    depth_m: 2491,
    tvd_m: 2218,
    mud_weight_pcf: 130,
    mud_temp_f: 120,
    funnel_viscosity: 42,
    api_filtrate_cc: 3.1,
    api_cake: 1,
    oil_percent: 0,
    water_percent: 63,
    solids_percent: 37,
    sand_percent: 0.25,
    mbt_lb_bbl: 2.5,
    ph: 9.5,
    ph_temp_f: 120,
    alkalinity_mud_ml: 0.5,
    pf_ml: 0.4,
    mf_ml: 0.9,
    chloride_mg_l: 178000,
    total_hardness_mg_l: 860,
  },
  {
    sample_from: "Active",
    flowline_temp_f: 119,
    depth_m: 2512.75,
    tvd_m: 2235.8,
    mud_weight_pcf: 130,
    mud_temp_f: 120,
    funnel_viscosity: 42,
    api_filtrate_cc: 3,
    api_cake: 1,
    oil_percent: 0,
    water_percent: 62,
    solids_percent: 38,
    sand_percent: 0.25,
    mbt_lb_bbl: 2.5,
    ph: 9.4,
    ph_temp_f: 120,
    alkalinity_mud_ml: 0.5,
    pf_ml: 0.3,
    mf_ml: 0.8,
    chloride_mg_l: 177500,
    total_hardness_mg_l: 840,
  },
  {
    sample_from: "Flow Line",
    flowline_temp_f: 124,
    depth_m: 2512.75,
    tvd_m: 2235.8,
    mud_weight_pcf: 129,
    mud_temp_f: 124,
    funnel_viscosity: 43,
    api_filtrate_cc: 3,
    api_cake: 1,
    oil_percent: 0,
    water_percent: 62,
    solids_percent: 38,
    sand_percent: 0.3,
    mbt_lb_bbl: 2.5,
    ph: 9.4,
    ph_temp_f: 124,
    alkalinity_mud_ml: 0.5,
    pf_ml: 0.3,
    mf_ml: 0.8,
    chloride_mg_l: 177500,
    total_hardness_mg_l: 840,
  },
  {
    sample_from: "Active",
    flowline_temp_f: 105,
    depth_m: 1860,
    tvd_m: 1642.3,
    mud_weight_pcf: 78,
    mud_temp_f: 100,
    funnel_viscosity: 48,
    api_filtrate_cc: 6.2,
    api_cake: 1,
    oil_percent: 0,
    water_percent: 92,
    solids_percent: 8,
    sand_percent: 0.2,
    mbt_lb_bbl: 17.5,
    ph: 9.2,
    ph_temp_f: 100,
    alkalinity_mud_ml: 0.8,
    pf_ml: 0.3,
    mf_ml: 0.7,
    chloride_mg_l: 1500,
    total_hardness_mg_l: 320,
  },
  {
    sample_from: "Active",
    flowline_temp_f: 108,
    depth_m: 1872,
    tvd_m: 1651,
    mud_weight_pcf: 78.5,
    mud_temp_f: 100,
    funnel_viscosity: 49,
    api_filtrate_cc: 6,
    api_cake: 1,
    oil_percent: 0,
    water_percent: 91.5,
    solids_percent: 8.5,
    sand_percent: 0.2,
    mbt_lb_bbl: 18,
    ph: 9.2,
    ph_temp_f: 100,
    alkalinity_mud_ml: 0.8,
    pf_ml: 0.3,
    mf_ml: 0.7,
    chloride_mg_l: 1600,
    total_hardness_mg_l: 340,
  },
  {
    sample_from: "Active",
    flowline_temp_f: 106,
    depth_m: 1894.5,
    tvd_m: 1671.6,
    mud_weight_pcf: 79,
    mud_temp_f: 100,
    funnel_viscosity: 50,
    api_filtrate_cc: 5.8,
    api_cake: 1,
    oil_percent: 0,
    water_percent: 91,
    solids_percent: 9,
    sand_percent: 0.25,
    mbt_lb_bbl: 18.5,
    ph: 9.3,
    ph_temp_f: 100,
    alkalinity_mud_ml: 0.9,
    pf_ml: 0.3,
    mf_ml: 0.7,
    chloride_mg_l: 1700,
    total_hardness_mg_l: 360,
  },
  {
    sample_from: "Reserve",
    flowline_temp_f: 104,
    depth_m: 1894.5,
    tvd_m: 1671.6,
    mud_weight_pcf: 75,
    mud_temp_f: 98,
    funnel_viscosity: 46,
    api_filtrate_cc: 6.5,
    api_cake: 1,
    oil_percent: 0,
    water_percent: 93,
    solids_percent: 7,
    sand_percent: 0.1,
    mbt_lb_bbl: 16,
    ph: 9.1,
    ph_temp_f: 98,
    alkalinity_mud_ml: 0.7,
    pf_ml: 0.2,
    mf_ml: 0.6,
    chloride_mg_l: 1400,
    total_hardness_mg_l: 300,
  },
];

const mudSamples: SeedRow[] = MUD_SAMPLES.map((sample, index) => ({
  id: FLUID_ID.mudSamples[index] as string,
  ...sampleKey(index),
  ...sample,
}));

const RHEOLOGY: Record<string, unknown>[] = [
  {
    temperature_f: 120,
    r600: 84,
    r300: 48,
    r200: 36,
    r100: 22,
    r6: 3,
    r3: 2,
    gel_10s: 3,
    gel_10m: 4,
    gel_30m: 5,
  },
  {
    temperature_f: 120,
    r600: 84,
    r300: 48,
    r200: 35,
    r100: 21,
    r6: 3,
    r3: 2,
    gel_10s: 3,
    gel_10m: 4,
    gel_30m: 5,
  },
  {
    temperature_f: 120,
    r600: 88,
    r300: 50,
    r200: 36,
    r100: 22,
    r6: 3,
    r3: 2,
    gel_10s: 3,
    gel_10m: 4,
    gel_30m: 6,
  },
  {
    temperature_f: 120,
    r600: 86,
    r300: 49,
    r200: 36,
    r100: 22,
    r6: 3,
    r3: 2,
    gel_10s: 3,
    gel_10m: 4,
    gel_30m: 5,
  },
  {
    temperature_f: 100,
    r600: 52,
    r300: 34,
    r200: 28,
    r100: 20,
    r6: 8,
    r3: 6,
    gel_10s: 7,
    gel_10m: 11,
    gel_30m: 15,
  },
  {
    temperature_f: 100,
    r600: 54,
    r300: 35,
    r200: 29,
    r100: 21,
    r6: 8,
    r3: 6,
    gel_10s: 7,
    gel_10m: 12,
    gel_30m: 16,
  },
  {
    temperature_f: 100,
    r600: 55,
    r300: 36,
    r200: 30,
    r100: 21,
    r6: 9,
    r3: 7,
    gel_10s: 8,
    gel_10m: 12,
    gel_30m: 17,
  },
  {
    temperature_f: 98,
    r600: 50,
    r300: 32,
    r200: 26,
    r100: 18,
    r6: 7,
    r3: 5,
    gel_10s: 6,
    gel_10m: 10,
    gel_30m: 14,
  },
];

const rheologyReadings: SeedRow[] = RHEOLOGY.map((reading, index) => ({
  id: FLUID_ID.rheology[index] as string,
  ...sampleKey(index),
  ...reading,
}));

const SOLIDS: Record<string, unknown>[] = [
  {
    mud_weight_pcf: 130,
    mbt_lb_bbl: 2.5,
    chloride_mg_l: 177000,
    oil_percent: 0,
    water_percent: 63,
    solids_percent: 37,
    glycol_percent: 0,
  },
  {
    mud_weight_pcf: 130,
    mbt_lb_bbl: 2.5,
    chloride_mg_l: 178000,
    oil_percent: 0,
    water_percent: 63,
    solids_percent: 37,
    glycol_percent: 0,
  },
  {
    mud_weight_pcf: 130,
    mbt_lb_bbl: 2.5,
    chloride_mg_l: 177500,
    oil_percent: 0,
    water_percent: 62,
    solids_percent: 38,
    glycol_percent: 0,
  },
  {
    mud_weight_pcf: 129,
    mbt_lb_bbl: 2.5,
    chloride_mg_l: 177500,
    oil_percent: 0,
    water_percent: 62,
    solids_percent: 38,
    glycol_percent: 0,
  },
  {
    mud_weight_pcf: 78,
    mbt_lb_bbl: 17.5,
    chloride_mg_l: 1500,
    oil_percent: 0,
    water_percent: 92,
    solids_percent: 8,
    glycol_percent: 0,
  },
  {
    mud_weight_pcf: 78.5,
    mbt_lb_bbl: 18,
    chloride_mg_l: 1600,
    oil_percent: 0,
    water_percent: 91.5,
    solids_percent: 8.5,
    glycol_percent: 0,
  },
  {
    mud_weight_pcf: 79,
    mbt_lb_bbl: 18.5,
    chloride_mg_l: 1700,
    oil_percent: 0,
    water_percent: 91,
    solids_percent: 9,
    glycol_percent: 0,
  },
  {
    mud_weight_pcf: 75,
    mbt_lb_bbl: 16,
    chloride_mg_l: 1400,
    oil_percent: 0,
    water_percent: 93,
    solids_percent: 7,
    glycol_percent: 0,
  },
];

const solidsAnalyses: SeedRow[] = SOLIDS.map((analysis, index) => ({
  id: FLUID_ID.solids[index] as string,
  ...sampleKey(index),
  ...analysis,
}));

const HYDRAULICS_ID = {
  intervals: makeIds("c", 8),
  tools: makeIds("c1", 12),
  bits: makeIds("c2", 4),
  survey: makeIds("c3", 12),
  inputs: makeIds("c4", 4),
};

// The geometry of each report: the casing to the shoe, then the open hole down to the bit.
// Reports 0 and 1 are in well 1 (9 5/8" casing), reports 2 and 3 in well 3 (13 3/8" casing).
const WELLBORE: [
  number,
  string,
  number,
  number,
  number | null,
  number,
  number | null,
][] = [
  [0, "casing", 0, 2283, 9.625, 8.625, 40],
  [0, "open_hole", 2283, 2480.5, null, 8.375, null],
  [1, "casing", 0, 2283, 9.625, 8.625, 40],
  [1, "open_hole", 2283, 2512.75, null, 8.375, null],
  [2, "casing", 0, 1700, 13.375, 12.415, 68],
  [2, "open_hole", 1700, 1860, null, 12.25, null],
  [3, "casing", 0, 1700, 13.375, 12.415, 68],
  [3, "open_hole", 1700, 1894.5, null, 12.25, null],
];

const wellboreIntervals: SeedRow[] = WELLBORE.map(
  (
    [
      report,
      interval_type,
      top_md_m,
      bottom_md_m,
      od_in,
      id_in,
      linear_weight_lb_ft,
    ],
    index,
  ) => ({
    id: HYDRAULICS_ID.intervals[index] as string,
    report_id: ID.reports[report] as string,
    order:
      WELLBORE.slice(0, index).filter((row) => row[0] === report).length + 1,
    interval_type,
    top_md_m,
    bottom_md_m,
    od_in,
    id_in,
    linear_weight_lb_ft,
  }),
);

// The drill string of each report, from the surface to the bit. The lengths add up to the bit depth.
const STRING: [number, string, number, number, number][] = [
  [0, '5" DP', 2180.5, 5, 4.276],
  [0, '5" HWDP', 150, 5, 3],
  [0, "BHA", 150, 6.5, 2.8],
  [1, '5" DP', 2212.75, 5, 4.276],
  [1, '5" HWDP', 150, 5, 3],
  [1, "BHA", 150, 6.5, 2.8],
  [2, '5" DP', 1560, 5, 4.276],
  [2, '5" HWDP', 150, 5, 3],
  [2, "BHA", 150, 8, 3],
  [3, '5" DP', 1594.5, 5, 4.276],
  [3, '5" HWDP', 150, 5, 3],
  [3, "BHA", 150, 8, 3],
];

const drillStringTools: SeedRow[] = STRING.map(
  ([report, tool_type, length_m, od_in, id_in], index) => ({
    id: HYDRAULICS_ID.tools[index] as string,
    report_id: ID.reports[report] as string,
    order: STRING.slice(0, index).filter((row) => row[0] === report).length + 1,
    tool_type,
    length_m,
    od_in,
    id_in,
  }),
);

const BITS: [
  number,
  string,
  number,
  string,
  { size_32nds: number; qty: number }[],
][] = [
  [
    0,
    "PDC",
    8.375,
    "Hughes Christensen",
    [
      { size_32nds: 12, qty: 3 },
      { size_32nds: 13, qty: 1 },
    ],
  ],
  [
    1,
    "PDC",
    8.375,
    "Hughes Christensen",
    [
      { size_32nds: 12, qty: 3 },
      { size_32nds: 13, qty: 1 },
    ],
  ],
  [2, "insert - roller cone", 12.25, "Smith", [{ size_32nds: 16, qty: 3 }]],
  [3, "insert - roller cone", 12.25, "Smith", [{ size_32nds: 16, qty: 3 }]],
];

const bits: SeedRow[] = BITS.map(
  ([report, bit_type, size_in, manufacturer, nozzles], index) => ({
    id: HYDRAULICS_ID.bits[index] as string,
    report_id: ID.reports[report] as string,
    bit_type,
    size_in,
    manufacturer,
    nozzles,
  }),
);

// The survey of wells 1 and 3 (the wells of the reports): building up, then holding the angle.
const SURVEY: [number, number, number, number][] = [
  [0, 300, 0.5, 40],
  [0, 800, 1.5, 48],
  [0, 1300, 2.5, 55],
  [0, 1800, 3.2, 60],
  [0, 2300, 3.8, 64],
  [0, 2512.75, 4, 65],
  [2, 300, 0.3, 120],
  [2, 700, 1.1, 128],
  [2, 1100, 1.8, 135],
  [2, 1500, 2.4, 140],
  [2, 1700, 2.8, 142],
  [2, 1894.5, 3, 143],
];

const surveyStations: SeedRow[] = SURVEY.map(
  ([well, md_m, inclination_deg, azimuth_deg], index) => ({
    id: HYDRAULICS_ID.survey[index] as string,
    well_id: ID.wells[well] as string,
    md_m,
    inclination_deg,
    azimuth_deg,
  }),
);

// The flowrate and the ROP of each report.
const hydraulicInputs: SeedRow[] = [
  [0, 400, 5],
  [1, 410, 5.5],
  [2, 650, 12],
  [3, 660, 11],
].map(([report, flowrate_gpm, rop_m_hr], index) => ({
  id: HYDRAULICS_ID.inputs[index] as string,
  report_id: ID.reports[report as number] as string,
  flowrate_gpm,
  rop_m_hr,
}));

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
    ["pits", pitCreateSchema, pits],
    ["pit readings", pitReadingCreateSchema, pitReadings],
    ["mud samples", mudSampleCreateSchema, mudSamples],
    ["rheology readings", rheologyCreateSchema, rheologyReadings],
    ["solids analyses", solidsAnalysisCreateSchema, solidsAnalyses],
    ["wellbore intervals", wellboreIntervalCreateSchema, wellboreIntervals],
    ["drill string tools", drillStringToolCreateSchema, drillStringTools],
    ["bits", bitCreateSchema, bits],
    ["survey stations", surveyStationCreateSchema, surveyStations],
    ["hydraulic inputs", hydraulicInputSetSchema, hydraulicInputs],
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

function validateProjectWells() {
  for (const project of projects) {
    const projectWells = wells.filter((well) => well.project_id === project.id);
    if (projectWells.length !== Number(project.wells)) {
      throw new Error(
        `Project ${project.id} declares ${project.wells} wells but has ${projectWells.length} seed wells.`,
      );
    }
  }
}

function validateSectionWells() {
  for (const section of sections) {
    if (!wells.some((well) => well.id === section.well_id)) {
      throw new Error(`Section ${section.id} references an unknown well.`);
    }
  }
}

function validateReportSections() {
  for (const report of dailyReports) {
    const section = sections.find((item) => item.id === report.section_id);
    if (!section || section.well_id !== report.well_id) {
      throw new Error(
        `Daily report ${report.id} must reference a section belonging to its well.`,
      );
    }
  }
}

function validateInventoryParents() {
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

// A report can only read the pits of its own project.
function validatePitReadings() {
  for (const reading of pitReadings) {
    const report = dailyReports.find((item) => item.id === reading.report_id);
    const well = wells.find((item) => item.id === report?.well_id);
    const pit = pits.find((item) => item.id === reading.pit_id);
    if (!well || !pit || well.project_id !== pit.project_id) {
      throw new Error(
        `Pit reading ${reading.id} connects a report and a pit from different projects.`,
      );
    }
  }
}

// The drill string of a report reaches the bit: its lengths add up to the bit depth.
function validateDrillStrings() {
  for (const report of dailyReports) {
    const length = drillStringTools
      .filter((tool) => tool.report_id === report.id)
      .reduce((sum, tool) => sum + Number(tool.length_m), 0);
    if (length > 0 && Math.abs(length - Number(report.bit_depth_m)) > 0.01) {
      throw new Error(
        `The drill string of report ${report.id} is ${length} m, but the bit is at ${report.bit_depth_m} m.`,
      );
    }
  }
}

function validateRelationships() {
  validateDrillStrings();
  validatePitReadings();
  validateProjectWells();
  validateSectionWells();
  validateReportSections();
  validateInventoryParents();
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
    { key: "pits", candidates: ["pits"], rows: pits },
    { key: "pit readings", candidates: ["pit_readings"], rows: pitReadings },
    { key: "mud samples", candidates: ["mud_samples"], rows: mudSamples },
    {
      key: "rheology readings",
      candidates: ["rheology_readings"],
      rows: rheologyReadings,
    },
    {
      key: "solids analyses",
      candidates: ["solids_analyses"],
      rows: solidsAnalyses,
    },
    {
      key: "wellbore intervals",
      candidates: ["wellbore_intervals"],
      rows: wellboreIntervals,
    },
    {
      key: "drill string tools",
      candidates: ["drill_string_tools"],
      rows: drillStringTools,
    },
    { key: "bits", candidates: ["bits"], rows: bits },
    {
      key: "survey stations",
      candidates: ["survey_stations"],
      rows: surveyStations,
    },
    {
      key: "hydraulic inputs",
      candidates: ["hydraulic_inputs"],
      rows: hydraulicInputs,
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
