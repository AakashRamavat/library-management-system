import request from 'supertest';

import { createApp } from '../../app';
import { initDb, sequelize } from '../../db/client';
import '../../db/models';
import { Book } from '../../db/models';

const app = createApp();

describe('Books API', () => {
  let accessToken: string;

  beforeAll(async () => {
    await initDb();
    await sequelize.sync({ force: true });

    await Book.bulkCreate([
      { title: 'Clean Code', author: 'Robert C. Martin', status: 'AVAILABLE' },
      { title: 'Domain-Driven Design', author: 'Eric Evans', status: 'AVAILABLE' },
    ]);

    const signUpRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'alice@example.com',
        password: 'password1234',
        name: 'Alice',
      });
    expect(signUpRes.status).toBe(201);
    accessToken = signUpRes.body.data.accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('lists available books when authenticated', async () => {
    const res = await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.total).toBe(2);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.totalPages).toBe(1);
  });

  it('rejects list books without token', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(401);
  });

  it('allows checking out an available book and prevents double checkout', async () => {
    const book = await Book.findOne();
    if (!book) {
      throw new Error('Expected at least one book');
    }

    const first = await request(app)
      .post('/api/books/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookId: book.id });

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/books/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookId: book.id });

    expect(second.status).toBe(400);
    expect(second.body.errorMessage).toMatch(/already checked out/i);
  });

  it('allows returning a checked-out book and prevents returning if not checked out', async () => {
    const book = await Book.create({
      title: 'Refactoring',
      author: 'Martin Fowler',
      status: 'AVAILABLE',
    });

    await request(app)
      .post('/api/books/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookId: book.id })
      .expect(201);

    const returned = await request(app)
      .post('/api/books/return')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookId: book.id });

    expect(returned.status).toBe(201);

    const secondReturn = await request(app)
      .post('/api/books/return')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookId: book.id });

    expect(secondReturn.status).toBe(400);
  });
});
