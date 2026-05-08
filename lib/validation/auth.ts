import { z } from "zod";

export const signUpSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(128),
});

export const signInSchema = signUpSchema;

export const revokeSessionSchema = z.object({
  sessionId: z.string().min(1),
});
