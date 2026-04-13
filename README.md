# BudgetPlaner

A mobile-first personal budget tracker for two users. Track expenses, set a monthly budget, analyse spending by category, and manage recurring costs — all in German.

**Live:** deployed on Vercel · **Backend:** Supabase

## Features

- **Dashboard** — budget gauge (spent vs. remaining), favourite quick-add tiles, recent transactions
- **Transaktionen** — month-by-month expense list with inline edit/delete
- **Analyse** — category breakdown, monthly trend chart, budget utilisation, savings summary
- **Einstellungen** — manage categories (emoji + colour), recurring expenses, favourites, monthly budget
- **Recurring expenses** — automatically created once per month on the configured day; idempotent (safe against concurrent requests)
- **Favourites** — save a description + category + amount as a template for fast re-entry
- **PWA-ready** — installable on iOS/Android, respects safe-area insets

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, server components) |
| Styling | Tailwind v4 + shadcn/ui (`@base-ui/react`) |
| Backend | Supabase (Postgres + Auth + RLS) |
| Deployment | Vercel |
| Language | TypeScript |

## Getting started

### 1. Clone & install

```bash
git clone https://github.com/jlnbln/Budget-Planner.git
cd Budget-Planner
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run each migration in order in the **SQL Editor**:
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_fix_recurring_duplicates.sql`

### 3. Configure environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  actions/        Server actions (auth, categories, expenses, recurring, settings)
  app/
    (app)/        Authenticated routes (dashboard, ausgaben, analyse, einstellungen)
    (auth)/       Auth routes (anmelden, registrieren)
  components/     Feature components + shadcn UI primitives
  lib/            Supabase clients, calculations, recurring logic
  types/          Database types and app interfaces
supabase/
  migrations/     SQL migrations — run manually in Supabase SQL Editor
```

## Deployment

Push to `main` — Vercel auto-deploys. Add the two environment variables in the Vercel project settings.
