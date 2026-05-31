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
