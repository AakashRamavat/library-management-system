import { sequelize } from '../db/client';
import { Book, User, Transaction } from '../db/models';
import { ApiError } from '../middleware/error-handler';
import type { CheckoutOrReturnInput, ListBooksQuery } from '../validators/books.validator';

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

export async function checkoutBook(
  input: CheckoutOrReturnInput,
  userId: string,
): Promise<void> {
  await sequelize.transaction(async (t) => {
    const book = await Book.findByPk(input.bookId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!book) {
      throw new ApiError({ statusCode: 404, message: 'Book not found' });
    }

    if (book.status === 'CHECKED_OUT') {
      throw new ApiError({
        statusCode: 400,
        message: 'Book is already checked out',
      });
    }

    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new ApiError({ statusCode: 401, message: 'User not found' });
    }

    await book.update(
      {
        status: 'CHECKED_OUT',
        holderId: user.id,
      },
      { transaction: t },
    );

    await Transaction.create(
      {
        action: 'CHECKOUT',
        bookId: book.id,
        userId: user.id,
      },
      { transaction: t },
    );
  });
}

export async function returnBook(
  input: CheckoutOrReturnInput,
  userId: string,
): Promise<void> {
  await sequelize.transaction(async (t) => {
    const book = await Book.findByPk(input.bookId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!book) {
      throw new ApiError({ statusCode: 404, message: 'Book not found' });
    }

    if (book.status === 'AVAILABLE') {
      throw new ApiError({
        statusCode: 400,
        message: 'Book is not currently checked out',
      });
    }

    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new ApiError({ statusCode: 401, message: 'User not found' });
    }

    await book.update(
      {
        status: 'AVAILABLE',
        holderId: null,
      },
      { transaction: t },
    );

    await Transaction.create(
      {
        action: 'RETURN',
        bookId: book.id,
        userId: user.id,
      },
      { transaction: t },
    );
  });
}
