import { z } from 'zod';

export const checkoutOrReturnBodySchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
});

export type CheckoutOrReturnInput = z.infer<typeof checkoutOrReturnBodySchema>;

export function validateCheckoutOrReturnBody(body: unknown): CheckoutOrReturnInput {
  return checkoutOrReturnBodySchema.parse(body);
}
