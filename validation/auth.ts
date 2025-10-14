import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().optional(),
  email: z.email().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const loginSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
