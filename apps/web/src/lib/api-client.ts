import { treaty } from "@elysiajs/eden";
import type { App } from "api";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.");
}

// parseDate: false because Eden would otherwise turn ISO strings into Date objects at
// runtime while the inferred types say `string`. The two must agree.
export const api = treaty<App>(apiUrl, { parseDate: false });
