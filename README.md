# IRON.FIT — React + Spring Boot

IRON.FIT keeps the existing Next.js/React interface and moves authentication data, workout generation, saved plans, progress records, profile storage, and admin statistics into a Spring Boot API backed by MySQL.

## Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: Java 17, Spring Boot 3.4, Spring Web, Spring JDBC, MySQL 8, Spring Security, JWT, BCrypt
- Optional AI provider: Anthropic Messages API; local deterministic generation is used when no key is configured or the provider is unavailable

## Requirements

- Node.js 20.9 or newer
- JDK 17 or newer
- Maven 3.9 or newer
- MySQL 8

## Configure

Copy the environment examples:

```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
```

Set a strong `AUTH_SECRET`, `JWT_SECRET`, and `IRONFIT_BRIDGE_SECRET`. Use the **same** `IRONFIT_BRIDGE_SECRET` in `.env.local` and `backend/.env`. Set your MySQL credentials in `backend/.env`. Google OAuth and Anthropic are optional.

The Next server signs a short-lived identity assertion when it forwards authenticated requests to Spring. The Spring API also accepts its own bearer JWT from `POST /api/auth/login`, so non-Next clients can use the API directly.

## Run

Terminal 1 — Spring Boot API:

```bash
cd backend
mvn spring-boot:run
```

Terminal 2 — React UI:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Next.js forwards its existing `/api/...` calls to `http://localhost:8080`, so the screens continue to use their current API paths. Spring creates the MySQL database and tables from `backend/src/main/resources/schema.sql`.

## Features

- Email/password signup and login, plus optional Google sign-in
- User-scoped profile and fitness settings
- Seven-day workout plan generation, with optional Anthropic generation and a deterministic fallback
- Save, list, view, rename, update progress on, and delete saved plans
- Body weight, measurements, BMI, and completed workout tracking
- User-scoped plan/progress access and admin-only aggregate statistics
- Existing PDF exports, navigation, responsive UI, loading, and toast behavior

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Validate credentials and return a JWT |
| POST | `/api/auth/oauth` | Server-bridged Google account sync |
| GET | `/api/auth/me` | Current authenticated account |
| POST | `/api/generate` | Validate profile and generate a 7-day plan |
| GET, POST | `/api/plans` | List or save the signed-in user’s plans |
| GET, PATCH, PUT, DELETE | `/api/plans/{id}` | Read, rename, track progress, or delete an owned plan |
| GET, POST | `/api/progress` | List or create body progress entries |
| GET, PATCH | `/api/user` | Read or update the signed-in user’s profile |
| GET | `/api/admin/stats` | Admin-only usage totals and recent users/plans |

## Admin access

New accounts use the `user` role. To grant an account admin access in a trusted MySQL session:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

Sign out and sign back in to refresh the role claim.

## Tests and checks

```bash
cd backend && mvn test
cd .. && npm run lint
npm run build
```

## Data migration

This repository contains the Java application and a new MySQL schema. It does not automatically import existing MongoDB accounts, workout plans, or progress records. Existing production data should be exported and migrated separately before switching users to this deployment.
