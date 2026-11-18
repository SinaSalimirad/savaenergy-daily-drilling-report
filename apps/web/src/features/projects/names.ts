/**
 * Several operators or contractors are stored in one text column, joined with ", ".
 */
export function normalizeNames(input: string): string {
  return input
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "")
    .join(", ");
}
