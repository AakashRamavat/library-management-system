import { z } from 'zod';

const bookIdsSchema = z
  .array(z.string().uuid('Invalid book ID'))
  .min(1, 'At least one book is required');

export const checkoutBodySchema = z.object({
  bookIds: bookIdsSchema,
});

export const returnBodySchema = z.object({
  bookIds: bookIdsSchema,
});

export type CheckoutInput = z.infer<typeof checkoutBodySchema>;
export type ReturnInput = z.infer<typeof returnBodySchema>;

export function validateCheckoutBody(body: unknown): CheckoutInput {
  return checkoutBodySchema.parse(body);
}

export function validateReturnBody(body: unknown): ReturnInput {
  return returnBodySchema.parse(body);
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
