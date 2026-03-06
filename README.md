# Library Management System

Monorepo: React (Vite) frontend + Node.js/Express API + PostgreSQL.

---

## System design

### Architecture

- **Frontend**: Single-page app (React 19, Vite 7, TypeScript). Talks to the API over HTTP; auth via JWT (Bearer token). Dev server proxies `/api` to the backend.
- **Backend**: REST API (Node.js 20, Express, TypeScript). Auth middleware protects routes; validated request bodies; controllers call services; services use Sequelize.
- **Database**: PostgreSQL 16 (Docker). One schema; Sequelize syncs models on startup.

```
┌─────────────┐     HTTP + JWT      ┌─────────────┐     Sequelize      ┌──────────────┐
│   React     │ ◄─────────────────► │   Express    │ ◄────────────────► │  PostgreSQL  │
│   (Vite)    │   localhost:5173    │   API :4000  │   localhost:5432   │  (Docker)     │
└─────────────┘                     └─────────────┘                     └──────────────┘
```

### Technologies

| Layer     | Choices |
|----------|---------|
| Frontend | React, Vite, TypeScript, React Router, Zustand |
| Backend  | Node.js 20, Express, TypeScript, Sequelize, Zod, JWT, bcrypt |
| Database | PostgreSQL 16 |
| Dev/ops  | Docker Compose (DB), ESLint, Jest (backend), Vitest + Testing Library (frontend) |

### Data models

- **User**  
  `id` (UUID), `email` (unique), `name`, `memberId` (optional, unique), `passwordHash`, `createdAt`, `updatedAt`.  
  Used for auth and as book holder.

- **Book**  
  `id` (UUID), `title`, `author`, `isbn` (optional, unique), `status` (`AVAILABLE` \| `CHECKED_OUT`), `holderId` (FK → User), `thumbnailUrl`, `createdAt`, `updatedAt`.  
  One physical copy per row; `holderId` set on checkout, cleared on return.

- **Transaction**  
  `id` (UUID), `bookId` (FK), `userId` (FK), `action` (`CHECKOUT` \| `RETURN`), `createdAt`.  
  Append-only audit log for each checkout/return.

Relations: `User` has many `Transaction`; `Book` has many `Transaction` and belongs to `User` (as holder); `Transaction` belongs to `User` and `Book`.

### API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/signup` | No | Register (email, password, optional name) |
| POST | `/api/auth/login` | No | Login (email, password) → access + refresh tokens |
| POST | `/api/auth/refresh` | No | New token pair (body: `refreshToken`) |
| GET | `/api/books` | Yes | List books (paginated). Query: `page`, `limit` |
| POST | `/api/books/checkout` | Yes | Check out books. Body: `{ "bookIds": ["uuid", ...] }` |
| POST | `/api/books/return` | Yes | Return books. Body: `{ "bookIds": ["uuid", ...] }` |
| GET | `/api/transactions` | Yes | List recent transactions (audit) |

Checkout and return are under `/api/books/` so they stay grouped with the book resource. Protected routes require header: `Authorization: Bearer <accessToken>`.

---

## Database choice and schema

**Why PostgreSQL**

- Relational data (users, books, transactions with FKs) fits a relational model.
- ACID and constraints (unique email, book status) keep data consistent.
- Indexes on `status`, `holderId`, and `(bookId, createdAt)` / `(userId, createdAt)` support list and audit queries.
- Common in production; easy to host and scale.

**Connection**

- Default: `postgresql://library_user:library_password@localhost:5432/library_db?schema=public` (see `.env`).
- Backend uses Sequelize with connection pooling (`DB_POOL_MIN`, `DB_POOL_MAX` in `.env` optional).
- Schema: tables `users`, `books`, `transactions`; Sequelize syncs on startup (no separate migration run for this setup).

---

## Performance considerations

- **Books list**: Paginated (`page`, `limit`; default 10, max 100) to avoid large responses and heavy queries.
- **Database**: Connection pooling (configurable min/max); indexes on `books.status`, `books.holderId`, and composite indexes on `transactions` for common filters and ordering.
- **Auth**: Stateless JWT; refresh token used to get new access token without hitting DB on every request.
- For much larger scale: read replicas, caching (e.g. Redis) for hot lists, and/or background jobs for heavy reporting.

---

## State management (frontend)

**Zustand** is used for global client state:

- **Auth**: `accessToken`, `refreshToken`, `user`; persisted to `localStorage` so sessions survive refresh. Login, signup, logout, and token refresh update this store.
- **Books**: Paginated list, loading/error; `fetchBooks(page, limit)`, `checkout(bookIds)`, `returnBook(bookIds)`.

**Why Zustand**

- Minimal boilerplate compared to Redux; no providers.
- Good fit for this scope (auth + one main list and actions).
- Persist middleware handles auth persistence; no extra wiring.
- API client reads the store for the current token and handles 401 + refresh so components stay simple.

---

## Assumptions

- **One copy per book**: Each `Book` row is one physical copy; no quantity or inventory count.
- **Authenticated checkout/return**: Only logged-in users can check out or return; identity comes from JWT (no anonymous or “guest” checkout).
- **Holder can return**: Only the user who has a book checked out (`holderId`) may return it (enforced in backend).
- **Single frontend origin**: CORS is set for `http://localhost:5173`; production would use the real frontend origin.
- **Sequelize sync**: Schema is kept in sync via `sequelize.sync()` at startup; production would typically use migrations instead.

---

## Running the project locally

**Option A — single command (from root):**  
Run `npm install` at the project root once (installs `concurrently`). Then `npm run dev` starts both the API and the frontend. Have the DB up and `.env` set first (steps 1–2 below).

**Option B — separate terminals:**  
Start the API and frontend separately (steps 3 and 6 below).

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
- **JWT**: access 1h, refresh 7d (set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`)

### 3. Start the backend (Option B only)

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

This inserts books if the table is empty (and skips if books already exist).

### 5. Quick API check

- **Health**: `GET http://localhost:4000/health`
- **Sign up**: `POST http://localhost:4000/api/auth/signup`  
  Body: `{ "email": "you@example.com", "password": "password1234", "name": "Your Name" }`
- **Login**: `POST http://localhost:4000/api/auth/login`  
  Body: `{ "email", "password" }`
- **Protected routes** (e.g. books): send header `Authorization: Bearer <accessToken>`

### 6. Run the frontend (Option B only)

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
