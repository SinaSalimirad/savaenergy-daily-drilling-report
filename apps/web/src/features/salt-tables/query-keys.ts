import type { SaltType } from "schema";

export const saltTableKeys = {
  all: ["salt-tables"] as const,
  list: (saltType: SaltType) => [...saltTableKeys.all, saltType] as const,
};
