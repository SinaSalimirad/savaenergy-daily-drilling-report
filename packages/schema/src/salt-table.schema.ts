import * as z from "zod";

// The salts of the rig's "Salt" sheet. Each one has its own reference table.
export const SALT_TYPES = ["KCl", "NaCl", "CaCl2"] as const;
export const saltTypeSchema = z.enum(SALT_TYPES);
export type SaltType = z.infer<typeof saltTypeSchema>;
