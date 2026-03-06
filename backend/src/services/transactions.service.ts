import { Transaction, Book, User } from '../db/models';

export async function listTransactions() {
  return Transaction.findAll({
    include: [
      {
        model: Book,
        as: 'book',
        attributes: ['id', 'title', 'author'],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'memberId', 'name'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: 100,
  });
}
