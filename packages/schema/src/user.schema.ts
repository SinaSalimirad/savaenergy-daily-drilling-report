import * as z from "zod";

// Kept separate from userCreateSchema so a role picker (web) can import just
// this, without pulling in the password rules too.
export const userRoleSchema = z.enum([
  "admin",
  "coordinator",
  "engineer",
  "client",
]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  username: z.string().trim().min(1).max(120),
  password: z.string().min(10).max(120),
  role: userRoleSchema,
});
export type UserCreate = z.infer<typeof userCreateSchema>;
