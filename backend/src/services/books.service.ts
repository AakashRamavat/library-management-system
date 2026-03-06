import { sequelize } from '../db/client';
import { Book, User, Transaction } from '../db/models';
import { ApiError } from '../middleware/error-handler';
import type { CheckoutInput, ListBooksQuery, ReturnInput } from '../validators/books.validator';

export interface ListBooksResult {
  items: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listBooks(query: ListBooksQuery): Promise<ListBooksResult> {
  const { page, limit } = query;
  const offset = (page - 1) * limit;

  const { count, rows } = await Book.findAndCountAll({
    include: [
      {
        model: User,
        as: 'holder',
        attributes: ['id', 'email', 'name', 'memberId'],
      },
    ],
    order: [['title', 'ASC']],
    limit,
    offset,
  });

  const totalPages = Math.ceil(count / limit) || 1;
  return {
    items: rows,
    total: count,
    page,
    limit,
    totalPages,
  };
}

export async function checkoutBooks(
  input: CheckoutInput,
  userId: string,
): Promise<{ checkedOut: number }> {
  let checkedOut = 0;
  await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new ApiError({ statusCode: 401, message: 'User not found' });
    }

    for (const bookId of input.bookIds) {
      const book = await Book.findByPk(bookId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!book) {
        throw new ApiError({ statusCode: 404, message: `Book not found: ${bookId}` });
      }

      if (book.status === 'CHECKED_OUT') {
        throw new ApiError({
          statusCode: 400,
          message: `"${book.title}" is already checked out`,
        });
      }

      await book.update(
        { status: 'CHECKED_OUT', holderId: user.id },
        { transaction: t },
      );
      await Transaction.create(
        { action: 'CHECKOUT', bookId: book.id, userId: user.id },
        { transaction: t },
      );
      checkedOut += 1;
    }
  });
  return { checkedOut };
}

export async function returnBooks(
  input: ReturnInput,
  userId: string,
): Promise<{ returned: number }> {
  let returned = 0;
  await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new ApiError({ statusCode: 401, message: 'User not found' });
    }

    for (const bookId of input.bookIds) {
      const book = await Book.findByPk(bookId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!book) {
        throw new ApiError({ statusCode: 404, message: `Book not found: ${bookId}` });
      }

      if (book.status === 'AVAILABLE') {
        throw new ApiError({
          statusCode: 400,
          message: `"${book.title}" is not currently checked out`,
        });
      }

      if (book.holderId !== user.id) {
        throw new ApiError({
          statusCode: 403,
          message: `You can only return books you have checked out`,
        });
      }

      await book.update(
        { status: 'AVAILABLE', holderId: null },
        { transaction: t },
      );
      await Transaction.create(
        { action: 'RETURN', bookId: book.id, userId: user.id },
        { transaction: t },
      );
      returned += 1;
    }
  });
  return { returned };
}
