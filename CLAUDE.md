# CLAUDE.md - Money Tracker Guidelines

This document contains the developer instructions, configuration guidelines, and strict environment separation policies for the **Money Tracker** personal project.

---

## 🚨 Strict Environment Separation Policy (No Work/Fury Configurations)

1. **NO FURY/WORK CONFIGURATIONS:**
   * This is a **100% personal project**. Under no circumstances should any work-related configurations, repositories, or services (such as `furycloud`, private enterprise registries, or corporate VPN requirements) be introduced.
   * If a command attempts to fetch or connect to `furycloud` or work resources, it is a configuration error. Stop and verify settings.
2. **USE PUBLIC REGISTRIES ONLY:**
   * Always enforce the public npm registry: `https://registry.npmjs.org/`
   * Do not use global `pnpm` configurations if they are wrapped by work-related network interceptors. **Strictly use standard `npm`** for local package installation and lockfile management.
3. **ISOLATE GIT CREDENTIALS:**
   * Ensure this repository only uses your personal git email and name locally:
     ```bash
     git config --local user.name "Your Personal Name"
     git config --local user.email "your-personal-email@example.com"
     ```
   * Never commit or push using corporate credentials.

---

## 🛠️ Build & Development Commands

### 1. Local Development Setup
* **Start local database (Docker Postgres):**
  ```bash
  docker-compose -f docker/dev/docker-compose.postgres.yml up -d postgres
  ```
* **Stop local database (Docker Postgres):**
  ```bash
  docker-compose -f docker/dev/docker-compose.postgres.yml down -v
  ```
* **Install dependencies (enforcing npm and public registry):**
  ```bash
  npm install --registry=https://registry.npmjs.org/ --no-audit --no-fund --legacy-peer-deps
  ```
* **Apply Database Schema (Drizzle Push):**
  ```bash
  npm run db:push
  ```
* **Seed Default Categories:**
  ```bash
  npm run db:seed
  ```
* **Run Dev Server:**
  ```bash
  npm run dev
  ```
  Access the panel at: [http://localhost:3000/gastos](http://localhost:3000/gastos)

### 2. Verification & Build
* **Validate TypeScript and Turbopack Build:**
  ```bash
  npm run build
  ```

---

## 📂 Architecture Overview

* **Authentication:** Supabase Auth (configured in `.env` for local and production).
* **Database (Local):** Local Postgres in Docker (port 5432).
* **Database (Production):** Supabase Cloud Postgres (configured as `DATABASE_URL` in Vercel with transaction pooler port 6543 and `?pgbouncer=true`).
* **Routing:** Next.js App Router. Main dashboard lives at `/gastos`. Landing page lives at `/`.

---

## 🔍 Troubleshooting

### 1. `TypeError: Invalid URL` (base: `postgres://base`) on Vercel
This error happens when the environment variable `DATABASE_URL` configured in the Vercel Project Settings cannot be parsed by Node.js/pg-connection-string.
*   **Cause A: Unencoded special characters in the password.**
    *   If your Supabase database password contains characters like `@`, `:`, `/`, `?`, `#`, `[`, `]`, it will break the URL parser.
    *   *Solution:* Change your Supabase database password in **Supabase Dashboard** -> **Settings** -> **Database** to a strong, **strictly alphanumeric** password (containing only letters and numbers, e.g., `VividTracker2026Secure`). Alternatively, URL-encode the special characters in the password (e.g., replace `@` with `%40`, `#` with `%23`).
*   **Cause B: Unreplaced `[YOUR-PASSWORD]` placeholder.**
    *   When copying the connection string, Supabase includes a placeholder like `[YOUR-PASSWORD]` or `[YOUR-DATABASE-PASSWORD]`.
    *   *Solution:* Verify your environment variable in Vercel and ensure you replaced `[YOUR-PASSWORD]` (including the square brackets) with your actual database password.
*   **Cause C: Connection Pooler configuration.**
    *   Make sure you are using the **Transaction Connection Pooler string** (which uses port `6543` and includes pooler-specific configurations like `?pgbouncer=true` if using pgbouncer, or standard pooling settings) in Vercel for proper scaling in Serverless environments.

