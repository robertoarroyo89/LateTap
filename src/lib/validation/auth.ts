import { z } from "zod";

export const sessionSchema = z.object({ idToken: z.string().min(100).max(10_000) });
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});
export const registerSchema = loginSchema.extend({
  displayName: z.string().trim().min(2).max(80),
  acceptTerms: z.literal(true),
});
