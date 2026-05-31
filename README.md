# Vivid Expense Tracker 🤑

A sleek, fast, and fully responsive multi-user personal finance tracker built with Next.js (App Router), PostgreSQL (Drizzle ORM), and Supabase Auth.

---

## Features

* **Multi-User Isolation:** Secure account signup and login powered by Supabase Auth.
* **Monthly & Yearly Dashboards:** Visual tracking with sleek monthly category breakdowns and interactive yearly bar charts.
* **Mobile-Native Experience:** Swipeable Bottom Sheets (Drawers) for smooth expense logging on mobile devices.
* **Smart Math Input:** Secure backend parsing of arithmetic expressions (e.g., `1500+250` or `1200*1.21`) inside the amount field.
* **Custom Category Builder:** Dynamic category creation with emoji selection and randomized accent colors.
* **Category Drill-Down:** Dedicated detail views with reactive sorting (date, value, concept).
* **Data Portability:** Direct CSV download of all expenses in a single click.

---

## Quick Start (Local Development)

### 1. Environment Setup
Copy the example variables:
```bash
cp .env.example .env
```
Fill in your cloud **Supabase project URL** and **Publishable Key** (`anon`) in the `.env` file.

### 2. Start Local PostgreSQL (Docker)
Ensure Docker is running, then boot the database container:
```bash
docker-compose -f docker/dev/docker-compose.postgres.yml up -d postgres
```

### 3. Sync & Seed Database
Initialize your tables and seed default categories:
```bash
npm run db:push
npm run db:seed
```

### 4. Run Next.js
Launch the development server:
```bash
npm run dev
```
Open **[http://localhost:3000/gastos](http://localhost:3000/gastos)** in your browser.
