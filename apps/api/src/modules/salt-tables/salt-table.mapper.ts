import type { SaltTableRow } from "./salt-table.repository";

/** The shape the web app receives, through Eden. */
export type SaltTableRowDto = {
  id: string;
  salt_type: SaltTableRow["salt_type"];
  // Weight percent of the salt in water.
  weight_percent: number;
  density_kg_l: number;
  density_lb_gal: number;
  // Chloride and the salt's cation (K+, Na+ or Ca2+), in mg/l.
  chloride_mg_l: number;
  cation_mg_l: number;
  // Pounds of salt per barrel of brine.
  salt_lb_bbl: number;
  water_bbl: number;
  // Degrees Fahrenheit.
  crystallization_point_f: number;
  water_activity: number;
  // Average specific gravity of the dissolved salt, as the sheet calculates it.
  solid_average_sg: number;
};

const SG_DECIMALS = 1000;

// The sheet's formula: (lb salt per bbl / 2.2) / (salt-free fraction of a bbl x 159 litres).
// It has no meaning when the brine holds no water, so that row gives `0`.
function solidAverageSg(saltLbBbl: number, waterBbl: number) {
  const saltFreeLitres = (1 - waterBbl) * 159;
  if (saltFreeLitres <= 0) return 0;
  return (
    Math.round((saltLbBbl / 2.2 / saltFreeLitres) * SG_DECIMALS) / SG_DECIMALS
  );
}

export function toSaltTableRowDto(row: SaltTableRow): SaltTableRowDto {
  return {
    id: row.id,
    salt_type: row.salt_type,
    weight_percent: row.weight_percent,
    density_kg_l: row.density_kg_l,
    density_lb_gal: row.density_lb_gal,
    chloride_mg_l: row.chloride_mg_l,
    cation_mg_l: row.cation_mg_l,
    salt_lb_bbl: row.salt_lb_bbl,
    water_bbl: row.water_bbl,
    crystallization_point_f: row.crystallization_point_f,
    water_activity: row.water_activity,
    solid_average_sg: solidAverageSg(row.salt_lb_bbl, row.water_bbl),
  };
}
