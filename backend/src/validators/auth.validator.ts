import { z } from 'zod';

const passwordMinLength = 8;

export const signUpBodySchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(passwordMinLength, `Password must be at least ${passwordMinLength} characters`),
  name: z.string().optional(),
});

export const loginBodySchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type SignUpInput = z.infer<typeof signUpBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type RefreshInput = z.infer<typeof refreshBodySchema>;

export function validateSignUpBody(body: unknown): SignUpInput {
  return signUpBodySchema.parse(body);
}

export function validateLoginBody(body: unknown): LoginInput {
  return loginBodySchema.parse(body);
}

export function validateRefreshBody(body: unknown): RefreshInput {
  return refreshBodySchema.parse(body);
}
