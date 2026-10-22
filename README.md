# 🎓 YSSE Alumni Directory (AlumniHub)

A full-stack, production-ready alumni directory and networking platform built with **Next.js 16 (App Router)**, **Express.js**, **Prisma 7**, **PostgreSQL (Neon)**, and **Better Auth** with JWT/JWKS role-based access control.

---

## 🌟 Features Overview

### 👤 Public & Member Features
- **Alumni Directory Explorer**:
  - Filter alumni by **graduation year** and **department**.
  - Search dynamically by **full name**.
  - Sort by **name (A–Z, Z–A)** or **graduation year (newest/oldest)**.
  - Server-side pagination and responsive grid layout.
- **Detailed Alumni Profile**:
  - Dedicated profile pages (`/alumni/[id]`) displaying education, department, current job position, company, location, and contact information.
- **Personal Saved Collection (Bookmarks)**:
  - Registered users can bookmark alumni cards directly from directory or profile pages.
  - Dedicated **Saved Alumni** dashboard (`/saved`) to manage saved connections.
  - Persisted in PostgreSQL (`saved_alumni` table) with duplicate prevention.
- **Authentication & Security**:
  - Email & password registration with secure server-side role assignment (`USER` by default; client role tampering is impossible).
  - Show/hide password toggling, input validation, and toast feedback.
  - **1-Click Demo Buttons** on the Login page for instant testing of both `User` and `Admin` personas.

### 🛡️ Administrative Features (`ADMIN` Role)
- **Protected Admin Dashboard (`/admin`)**:
  - Real-time metrics: Total Alumni, Total Registered Users, Total Administrators.
- **Alumni Management (Full CRUD)**:
  - Create new alumni records with real-time validation.
  - Edit existing alumni information.
  - Delete alumni profiles with confirmation dialogs and automatic cache revalidation.
- **User & RBAC Management**:
  - View all registered users with their assigned roles and creation dates.
  - Promote or demote users between `USER` and `ADMIN` in real time.
  - Built-in self-lockout prevention (administrators cannot revoke their own admin status).
- **Server-Side Authorization**:
  - Cryptographic JWT verification via `jose-cjs` and Better Auth JWKS endpoint.
  - Strict 401 Unauthorized / 403 Forbidden responses on all protected API endpoints.
  - Dedicated CLI script (`npm run make-admin <email>`) for safe administrative bootstrapping.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 16 (App Router)](https://nextjs.org), [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS v4](https://tailwindcss.com), [Lucide React](https://lucide.dev), [Sonner](https://sonner.emilkowal.ski) |
| **Backend** | [Node.js](https://nodejs.org), [Express.js v5](https://expressjs.com), [TypeScript](https://www.typescriptlang.org) |
| **Database & ORM** | [PostgreSQL (Neon Serverless)](https://neon.tech), [Prisma 7](https://www.prisma.io) with `@prisma/adapter-pg` |
| **Authentication** | [Better Auth](https://www.better-auth.com) with Prisma Adapter & official `jwt` plugin |
| **Token Verification** | [`jose-cjs`](https://github.com/panva/jose) (`createRemoteJWKSet` & `jwtVerify`) |
| **Deployment** | [Vercel](https://vercel.com) (Frontend Next.js app + Serverless Express API) |

---

## 📁 Repository Structure

```text
Alumni-directory/
├── alumni-directory/                 # Next.js Frontend & Better Auth Server
│   ├── prisma/
│   │   └── schema.prisma             # Prisma schema (User, Session, Account, Alumni, SavedAlumni, Jwks)
│   ├── scripts/
│   │   └── make-admin.ts             # CLI command to promote an email to ADMIN
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages and server actions
│   │   │   ├── actions.ts            # Server Actions for alumni mutations & bookmarks
│   │   │   ├── admin/                # Admin Dashboard page
│   │   │   ├── alumni/[id]/          # Alumni detail & edit pages
│   │   │   ├── api/auth/[...all]/    # Better Auth route handlers & JWKS endpoints
│   │   │   ├── dashboard/            # User profile dashboard
│   │   │   ├── login/                # Sign In page (with 1-click demo buttons)
│   │   │   ├── register/             # Sign Up page
│   │   │   └── saved/                # Saved / Bookmarked Alumni page
│   │   ├── components/               # UI components (AlumniCard, Navbar, Forms, Modals)
│   │   └── lib/
│   │       ├── api.ts                # Centralized API client with JWT Bearer attachment
│   │       ├── auth.ts               # Better Auth server configuration with JWT plugin
│   │       ├── auth-client.ts        # Better Auth client instance (signIn, signOut, token)
│   │       └── auth-server.ts        # Server-side session & token retrieval helpers
│   ├── package.json
│   └── vercel.json
│
└── alumni-directory-backend/         # Express.js REST API
    ├── api/
    │   └── index.ts                  # Serverless function entrypoint for Vercel
    ├── prisma/
    │   └── schema.prisma             # Backend Prisma schema
    ├── src/
    │   ├── lib/
    │   │   └── prisma.ts             # Prisma client singleton
    │   ├── middleware/
    │   │   └── auth.ts               # JWT verification via jose-cjs & RBAC middleware
    │   ├── routes/
    │   │   └── routes.ts             # Main router
    │   ├── services/
    │   │   ├── admin.ts              # Admin endpoints (stats, user management, role update)
    │   │   ├── alumni.ts             # Alumni endpoints (list, get, create, patch, delete)
    │   │   ├── saved.ts              # Saved cards endpoints (list, check, save, unsave)
    │   │   └── user.ts               # User auth endpoints (register, login, me, profile)
    │   ├── app.ts                    # Express application configuration & CORS
    │   └── server.ts                 # Local server listening on PORT
    ├── package.json
    └── vercel.json                   # Vercel v2 serverless rewrites
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+
- **npm** / **pnpm** / **yarn**
- **PostgreSQL Database**: [Neon](https://neon.tech) connection string or a local PostgreSQL instance.

---

### 2. Backend Setup (`alumni-directory-backend`)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd alumni-directory-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   # PostgreSQL connection string
   DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"

   # Frontend application URL (used for CORS and JWKS retrieval)
   FRONTEND_URL="http://localhost:3000"

   # Better Auth URL (matches frontend URL)
   BETTER_AUTH_URL="http://localhost:3000"

   # Server port
   PORT=5000
   ```

4. Generate Prisma Client and sync database:
   ```bash
   npx prisma generate
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run at [http://localhost:5000](http://localhost:5000).*

---

### 3. Frontend Setup (`alumni-directory`)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd alumni-directory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env.local`:
   ```env
   # PostgreSQL connection string (same database as backend)
   DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"

   # Backend Express API URL
   NEXT_PUBLIC_API_URL="http://localhost:5000"

   # Better Auth configuration
   BETTER_AUTH_SECRET="mLeOnPL23yL8JZglEQj7gV3oAZzFifvq" # or generate a random 32-char string
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
   ```

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 🔑 Demo Accounts

The Login page (`/login`) includes **1-Click Demo Buttons** that instantly populate credentials:

| Persona | Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- | :--- |
| **Normal User** | `USER` | `levi@gmai.com` | `Levi12345` | Browse alumni, search/filter, bookmark cards, view `/saved` & `/dashboard` |
| **Administrator** | `ADMIN` | `eren@gmail.com` | `Eren12345` | All user features + access to `/admin`, create/edit/delete alumni, change user roles |

> [!TIP]
> To promote any other registered user to an administrator locally, run:
> ```bash
> npm run make-admin <user-email>
> ```

---

## 📡 API Reference

All protected endpoints require an `Authorization: Bearer <access_token>` header obtained via Better Auth's token system.

### 🌐 Public Endpoints
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/health` / `/api/health` | Health check & uptime status |
| `GET` | `/api/alumni` | Paginated alumni list with `search`, `department`, `graduationYear`, `sort`, `page`, `limit` |
| `GET` | `/api/alumni/:id` | Fetch single alumnus profile by ID |
| `POST`| `/api/user/register` | Register new user account (defaults to `USER`) |
| `POST`| `/api/user/login` | Authenticate user credentials |
| `GET` | `/api/auth/jwks` | Better Auth public key set for JWT verification |

### 🔒 Authenticated Endpoints (`USER` or `ADMIN`)
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/user/me` | Retrieve currently authenticated user profile |
| `GET` | `/api/saved` | List all saved/bookmarked alumni for current user |
| `GET` | `/api/saved/check/:alumniId` | Check whether an alumnus is bookmarked |
| `POST`| `/api/saved` | Bookmark an alumnus card (`{ "alumniId": "..." }`) |
| `DELETE`| `/api/saved/:alumniId` | Remove an alumnus from saved bookmarks |

### 🛡️ Admin Endpoints (`ADMIN` Only)
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/alumni` | Create a new alumni record |
| `PATCH`| `/api/alumni/:id` | Update an existing alumni record |
| `DELETE`| `/api/alumni/:id` | Delete an alumni record |
| `GET` | `/api/admin/stats` | Platform statistics (total alumni, users, admins) |
| `GET` | `/api/admin/users` | List all registered platform users |
| `PATCH`| `/api/admin/users/:id/role` | Update user role (`USER` or `ADMIN`, self-lockout prevented) |

---

## 🚀 Deployment (Vercel)

Both repositories are fully configured for zero-config Vercel deployment.

### Step 1: Deploy Backend (`alumni-directory-backend`)
1. Create a new project on Vercel and select `alumni-directory-backend`.
2. Framework Preset: **Other**.
3. Build Command: `npm run build` (auto-detected).
4. Add Environment Variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `FRONTEND_URL`: URL of your deployed frontend (e.g., `https://alumni-hub.vercel.app`).
   - `BETTER_AUTH_URL`: Same as `FRONTEND_URL`.
5. Deploy and copy your backend production URL (e.g., `https://alumni-backend.vercel.app`).

### Step 2: Deploy Frontend (`alumni-directory`)
1. Create a new project on Vercel and select `alumni-directory`.
2. Framework Preset: **Next.js** (auto-detected).
3. Add Environment Variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `NEXT_PUBLIC_API_URL`: Backend URL from Step 1 (e.g., `https://alumni-backend.vercel.app`).
   - `BETTER_AUTH_SECRET`: Your 32-character secret key.
   - `BETTER_AUTH_URL`: Your frontend Vercel URL (e.g., `https://alumni-hub.vercel.app`).
   - `NEXT_PUBLIC_BETTER_AUTH_URL`: Same as `BETTER_AUTH_URL`.
4. Deploy!

---

## 📜 Database Schema Summary

```prisma
model User {
  id            String        @id @default(uuid())
  name          String
  email         String        @unique
  emailVerified Boolean       @default(false)
  image         String?
  role          String        @default("USER") # "USER" | "ADMIN"
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  sessions      Session[]
  accounts      Account[]
  savedAlumni   SavedAlumni[]
}

model Alumni {
  id              String        @id @default(uuid())
  fullName        String
  email           String        @unique
  graduationYear  Int
  department      String
  currentCompany  String?
  currentPosition String?
  location        String?
  avatarUrl       String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  savedBy         SavedAlumni[]
}

model SavedAlumni {
  id        String   @id @default(uuid())
  userId    String
  alumniId  String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  alumni    Alumni   @relation(fields: [alumniId], references: [id], onDelete: Cascade)

  @@unique([userId, alumniId])
}

model Jwks {
  id         String    @id @default(uuid())
  publicKey  String
  privateKey String
  createdAt  DateTime
  expiresAt  DateTime?
  alg        String?
  crv        String?
}
```

---

## 🤝 Contributing & License
Developed as part of the YSSE Alumni Directory initiative. Licensed under the [ISC License](LICENSE).

   # Server port
   PORT=5000
   ```

4. Generate Prisma Client and sync database:
   ```bash
   npx prisma generate
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run at [http://localhost:5000](http://localhost:5000).*

---

### 3. Frontend Setup (`alumni-directory`)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd alumni-directory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env.local`:
   ```env
   # PostgreSQL connection string (same database as backend)
   DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"

   # Backend Express API URL
   NEXT_PUBLIC_API_URL="http://localhost:5000"

   # Better Auth configuration
   BETTER_AUTH_SECRET="mLeOnPL23yL8JZglEQj7gV3oAZzFifvq" # or generate a random 32-char string
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
   ```

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 🔑 Demo Accounts

The Login page (`/login`) includes **1-Click Demo Buttons** that instantly populate credentials:

| Persona | Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- | :--- |
| **Normal User** | `USER` | `levi@gmai.com` | `Levi12345` | Browse alumni, search/filter, bookmark cards, view `/saved` & `/dashboard` |
| **Administrator** | `ADMIN` | `eren@gmail.com` | `Eren12345` | All user features + access to `/admin`, create/edit/delete alumni, change user roles |

> [!TIP]
> To promote any other registered user to an administrator locally, run:
> ```bash
> npm run make-admin <user-email>
> ```

---

## 📡 API Reference

All protected endpoints require an `Authorization: Bearer <access_token>` header obtained via Better Auth's token system.

### 🌐 Public Endpoints
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/health` / `/api/health` | Health check & uptime status |
| `GET` | `/api/alumni` | Paginated alumni list with `search`, `department`, `graduationYear`, `sort`, `page`, `limit` |
| `GET` | `/api/alumni/:id` | Fetch single alumnus profile by ID |
| `POST`| `/api/user/register` | Register new user account (defaults to `USER`) |
| `POST`| `/api/user/login` | Authenticate user credentials |
| `GET` | `/api/auth/jwks` | Better Auth public key set for JWT verification |

### 🔒 Authenticated Endpoints (`USER` or `ADMIN`)
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/user/me` | Retrieve currently authenticated user profile |
| `GET` | `/api/saved` | List all saved/bookmarked alumni for current user |
| `GET` | `/api/saved/check/:alumniId` | Check whether an alumnus is bookmarked |
| `POST`| `/api/saved` | Bookmark an alumnus card (`{ "alumniId": "..." }`) |
| `DELETE`| `/api/saved/:alumniId` | Remove an alumnus from saved bookmarks |

### 🛡️ Admin Endpoints (`ADMIN` Only)
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/alumni` | Create a new alumni record |
| `PATCH`| `/api/alumni/:id` | Update an existing alumni record |
| `DELETE`| `/api/alumni/:id` | Delete an alumni record |
| `GET` | `/api/admin/stats` | Platform statistics (total alumni, users, admins) |
| `GET` | `/api/admin/users` | List all registered platform users |
| `PATCH`| `/api/admin/users/:id/role` | Update user role (`USER` or `ADMIN`, self-lockout prevented) |

---

## 🚀 Deployment (Vercel)

Both repositories are fully configured for zero-config Vercel deployment.

### Step 1: Deploy Backend (`alumni-directory-backend`)
1. Create a new project on Vercel and select `alumni-directory-backend`.
2. Framework Preset: **Other**.
3. Build Command: `npm run build` (auto-detected).
4. Add Environment Variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `FRONTEND_URL`: URL of your deployed frontend (e.g., `https://alumni-hub.vercel.app`).
   - `BETTER_AUTH_URL`: Same as `FRONTEND_URL`.
5. Deploy and copy your backend production URL (e.g., `https://alumni-backend.vercel.app`).

### Step 2: Deploy Frontend (`alumni-directory`)
1. Create a new project on Vercel and select `alumni-directory`.
2. Framework Preset: **Next.js** (auto-detected).
3. Add Environment Variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `NEXT_PUBLIC_API_URL`: Backend URL from Step 1 (e.g., `https://alumni-backend.vercel.app`).
   - `BETTER_AUTH_SECRET`: Your 32-character secret key.
   - `BETTER_AUTH_URL`: Your frontend Vercel URL (e.g., `https://alumni-hub.vercel.app`).
   - `NEXT_PUBLIC_BETTER_AUTH_URL`: Same as `BETTER_AUTH_URL`.
4. Deploy!

---

## 📜 Database Schema Summary

```prisma
model User {
  id            String        @id @default(uuid())
  name          String
  email         String        @unique
  emailVerified Boolean       @default(false)
  image         String?
  role          String        @default("USER") # "USER" | "ADMIN"
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  sessions      Session[]
  accounts      Account[]
  savedAlumni   SavedAlumni[]
}

model Alumni {
  id              String        @id @default(uuid())
  fullName        String
  email           String        @unique
  graduationYear  Int
  department      String
  currentCompany  String?
  currentPosition String?
  location        String?
  avatarUrl       String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  savedBy         SavedAlumni[]
}

model SavedAlumni {
  id        String   @id @default(uuid())
  userId    String
  alumniId  String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  alumni    Alumni   @relation(fields: [alumniId], references: [id], onDelete: Cascade)

  @@unique([userId, alumniId])
}

model Jwks {
  id         String    @id @default(uuid())
  publicKey  String
  privateKey String
  createdAt  DateTime
  expiresAt  DateTime?
  alg        String?
  crv        String?
}
```

---

## 🤝 Contributing & License
Developed as part of the YSSE Alumni Directory initiative. Licensed under the [ISC License](LICENSE).

