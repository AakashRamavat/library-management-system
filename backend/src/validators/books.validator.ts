import { z } from 'zod';

export const checkoutOrReturnBodySchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
});

export type CheckoutOrReturnInput = z.infer<typeof checkoutOrReturnBodySchema>;

export function validateCheckoutOrReturnBody(body: unknown): CheckoutOrReturnInput {
  return checkoutOrReturnBodySchema.parse(body);
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const listBooksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>;

export function validateListBooksQuery(query: unknown): ListBooksQuery {
  return listBooksQuerySchema.parse(query);
}
