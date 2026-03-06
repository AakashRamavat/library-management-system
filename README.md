# Library Management System

Monorepo: React (Vite) frontend + Node.js/Express API + PostgreSQL.

## Running the API locally

### 1. Start PostgreSQL

From the **project root**:

```bash
npm run db:up
```

This runs `docker compose up -d` and starts Postgres on port 5432. Wait a few seconds for it to be ready.

### 2. Environment

A `.env` file is required at the **project root** (used by Docker Compose and the backend). Copy from the example:

```bash
cp .env.example .env
```

Edit `.env` if you need different DB credentials or JWT secrets. Defaults:

- **Database**: `library_user` / `library_password` / `library_db` on `localhost:5432`
- **API**: `http://localhost:4000`
- **JWT**: access 15m, refresh 7d (set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`)

### 3. Start the backend

```bash
npm run dev:api
```

Or from the backend folder:

```bash
cd backend && npm install && npm run dev
```

The API will sync the database schema and listen on http://localhost:4000.

### 4. Seed books (optional)

To add sample books so you can try checkout/return from the frontend:

```bash
cd backend && npm run seed
```

This inserts 8 books if the table is empty (and skips if books already exist).

### 5. Quick API check

- **Health**: `GET http://localhost:4000/health`
- **Sign up**: `POST http://localhost:4000/api/auth/signup`  
  Body: `{ "email": "you@example.com", "password": "password1234", "name": "Your Name" }`
- **Login**: `POST http://localhost:4000/api/auth/login`  
  Body: `{ "email", "password" }`
- **Protected routes** (e.g. books): send header `Authorization: Bearer <accessToken>`

### 6. Run the frontend

With the API running, from the **project root**:

```bash
cd frontend && npm install && npm run dev
```

The app will be at http://localhost:5173. Sign up or log in, then browse books, check out, and return. Run `npm run seed` in the backend first if you want sample books.

### Other commands

- **Stop DB**: `npm run db:down`
- **DB logs**: `npm run db:logs`
- **Backend tests**: `cd backend && npm test` (requires Postgres and `.env` or test defaults in `jest.setup.ts`)
- **Frontend tests**: `cd frontend && npm test`
