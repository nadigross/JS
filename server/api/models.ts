import { z } from "zod";
import { users } from "../src/db/schema.js";
import { createInsertSchema } from "drizzle-zod";

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string(),
});

export const insertUserSchema = createInsertSchema(users);
export type Login = z.infer<typeof loginSchema>;
