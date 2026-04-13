@AGENTS.md

# BudgetPlaner — Project Guide for Claude

## Stack

- **Next.js** (App Router, server components, `searchParams` is a `Promise` — always `await` it)
- **Tailwind v4** — no `tailwind.config.js`. All theme tokens live in `src/app/globals.css` via `@theme inline`. Use `var(--color-*)` / utility classes directly.
- **shadcn/ui** components backed by `@base-ui/react` (not Radix). APIs differ — read the component source before using.
- **Supabase** for auth + database. Client: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server components / actions).
- **Fonts**: Geist (`--font-sans`) for body, Manrope (`--font-headline`) for headings — use `font-headline` class.
- **Language**: all UI text is German.

## Project structure

```
src/
  actions/          # Server actions (auth, categories, expenses, recurring, settings)
  app/
    (app)/          # Authenticated routes — layout applies auth guard + app shell
    (auth)/         # Unauthenticated routes (anmelden, registrieren)
  components/
    analyse/        # Chart components
    ausgaben/       # Expense list + edit sheet
    dashboard/      # Budget gauge, FAB modal, favorites, recent list
    einstellungen/  # Category, recurring, favorite, budget managers
    layout/         # BottomNav
    ui/             # shadcn primitives (button, sheet, select, …)
  lib/
    calculations.ts # Monthly stats helpers
    recurring.ts    # applyRecurringExpenses + checkAndFinalizeMonths
    supabase/
  middleware.ts     # Supabase auth session refresh
  types/database.ts # DB types + app-level interfaces
supabase/
  migrations/       # Run in Supabase SQL Editor in order
```

## Key conventions

- **Server actions** live in `src/actions/`. Always verify `auth.getUser()` before any mutation.
- **Page data** is fetched in server components; client components handle interactivity only.
- **Sheets** (`src/components/ui/sheet.tsx`) are `z-[60]`. Select dropdowns are `z-[70]`. BottomNav is `z-50`. The FAB uses `bottom-[calc(5.5rem+env(safe-area-inset-bottom))]` to clear the nav on iOS PWA.
- **Bottom sheets** get `pb-[max(1.5rem,env(safe-area-inset-bottom))]` for safe-area padding. Save/delete buttons are full-width `py-4`.
- **Edit sheets**: populate form state via `useEffect` on `[open, entity]`, not inside `onOpenChange` (controlled `open` prop does not trigger `onOpenChange` on open).
- **Recurring expenses**: `applyRecurringExpenses` uses `upsert` with `ignoreDuplicates: true` + a unique index on `(recurring_id, expense_date)` to stay idempotent across concurrent calls.

## Design tokens (key colors)

| Token | Value | Use |
|---|---|---|
| `--primary` / `#001939` | Navy | Buttons, active states, headings |
| `--background` / `#f8f9fa` | Light grey | Page background |
| `--card` / `#ffffff` | White | Card surfaces |
| `--input` / `#e7e8e9` | Off-white | Input backgrounds |
| `--border` / `#c3c6d0` | Grey | Borders |
| `#ba1a1a` | Red | Destructive actions |

## Database migrations

Migrations are in `supabase/migrations/` and must be run manually in the Supabase SQL Editor in filename order. There is no CLI migration runner configured.

| File | Description |
|---|---|
| `0001_initial_schema.sql` | Tables, RLS policies, new-user trigger |
| `0002_fix_recurring_duplicates.sql` | Deduplicate recurring expenses + unique index |
