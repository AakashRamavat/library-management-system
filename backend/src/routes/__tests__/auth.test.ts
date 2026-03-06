import request from 'supertest';

import { createApp } from '../../app';
import { initDb, sequelize } from '../../db/client';
import '../../db/models';
import { User } from '../../db/models';

const app = createApp();

describe('Auth API', () => {
  beforeAll(async () => {
    await initDb();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/signup', () => {
    it('creates a user and returns tokens', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'password1234',
          name: 'New User',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe(true);
      expect(res.body.data).toMatchObject({
        user: {
          email: 'newuser@example.com',
          name: 'New User',
        },
      });
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(typeof res.body.data.user.id).toBe('string');
    });

    it('rejects duplicate email with 409', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'duplicate@example.com',
          password: 'password1234',
        })
        .expect(201);

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'duplicate@example.com',
          password: 'anotherpass1234',
        });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe(false);
      expect(res.body.errorMessage).toMatch(/already registered/i);
    });

    it('rejects invalid email with 400', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'not-an-email',
          password: 'password1234',
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
    });

    it('rejects short password with 400', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'valid@example.com',
          password: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
      expect(res.body.errorMessage).toMatch(/password/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await User.destroy({ where: {}, force: true });
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'loginuser@example.com',
          password: 'password1234',
          name: 'Login User',
        });
    });

    it('returns tokens for valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'password1234',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data.user.email).toBe('loginuser@example.com');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('rejects wrong password with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe(false);
    });

    it('rejects unknown email with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'password1234',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'password1234',
        });
      refreshToken = loginRes.body.data.refreshToken;
    });

    it('returns new token pair for valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('rejects invalid refresh token with 401', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe(false);
    });

    it('rejects empty refresh token with 400', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: '' });

      expect(res.status).toBe(400);
    });
  });
});
