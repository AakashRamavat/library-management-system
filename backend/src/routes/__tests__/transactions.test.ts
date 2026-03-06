import request from 'supertest';

import { createApp } from '../../app';
import { initDb, sequelize } from '../../db/client';
import '../../db/models';
import { Book } from '../../db/models';

const app = createApp();

describe('Transactions API', () => {
  let accessToken: string;

  beforeAll(async () => {
    await initDb();
    await sequelize.sync({ force: true });

    const signUpRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'txuser@example.com',
        password: 'password1234',
        name: 'Tx User',
      });
    expect(signUpRes.status).toBe(201);
    accessToken = signUpRes.body.data.accessToken;

    const book = await Book.create({
      title: 'Test Book',
      author: 'Test Author',
      status: 'AVAILABLE',
    });
    await request(app)
      .post('/api/books/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bookIds: [book.id] })
      .expect(201);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/transactions', () => {
    it('returns transaction list when authenticated', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const first = res.body.data[0];
      expect(first).toHaveProperty('action');
      expect(first).toHaveProperty('bookId');
      expect(first).toHaveProperty('userId');
      expect(first).toHaveProperty('createdAt');
      expect(['CHECKOUT', 'RETURN']).toContain(first.action);
    });

    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/transactions');
      expect(res.status).toBe(401);
      expect(res.body.status).toBe(false);
    });
  });
});
