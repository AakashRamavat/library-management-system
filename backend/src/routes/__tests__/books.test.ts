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

  it('allows checking out multiple books and prevents double checkout', async () => {
    const books = await Book.findAll({ limit: 2 });
    if (books.length < 2) {
      throw new Error('Expected at least two books');
    }
    const [firstBook, secondBook] = books;

    const first = await request(app)
      .post('/api/books/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookIds: [firstBook.id, secondBook.id] });

    expect(first.status).toBe(201);
    expect(first.body.data.message).toMatch(/2 books checked out/i);

    const second = await request(app)
      .post('/api/books/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookIds: [firstBook.id] });

    expect(second.status).toBe(400);
    expect(second.body.errorMessage).toMatch(/already checked out/i);
  });

  it('allows returning multiple checked-out books and prevents returning if not checked out', async () => {
    const book = await Book.create({
      title: 'Refactoring',
      author: 'Martin Fowler',
      status: 'AVAILABLE',
    });

    await request(app)
      .post('/api/books/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookIds: [book.id] })
      .expect(201);

    const returned = await request(app)
      .post('/api/books/return')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookIds: [book.id] });

    expect(returned.status).toBe(201);
    expect(returned.body.data.message).toMatch(/Book returned successfully/i);

    const secondReturn = await request(app)
      .post('/api/books/return')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookIds: [book.id] });

    expect(secondReturn.status).toBe(400);
  });

  it('rejects checkout with empty bookIds with 400', async () => {
    const res = await request(app)
      .post('/api/books/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookIds: [] });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.errorMessage).toMatch(/at least one/i);
  });

  it('rejects checkout with invalid bookId format with 400', async () => {
    const res = await request(app)
      .post('/api/books/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookIds: ['not-a-uuid'] });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
  });

  it('rejects checkout for non-existent book with 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .post('/api/books/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookIds: [fakeId] });

    expect(res.status).toBe(404);
    expect(res.body.errorMessage).toMatch(/not found/i);
  });

  it('rejects return when book is held by another user with 403', async () => {
    const book = await Book.create({
      title: 'Held By Alice',
      author: 'Test',
      status: 'AVAILABLE',
    });

    await request(app)
      .post('/api/books/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookIds: [book.id] })
      .expect(201);

    const bobRes = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'bob@example.com', password: 'password1234', name: 'Bob' });
    expect(bobRes.status).toBe(201);
    const bobToken = bobRes.body.data.accessToken;

    const res = await request(app)
      .post('/api/books/return')
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ bookIds: [book.id] });

    expect(res.status).toBe(403);
    expect(res.body.errorMessage).toMatch(/only return books you have checked out/i);
  });
});
