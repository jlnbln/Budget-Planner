-- ============================================================
-- Haushaltsbuch — Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ─── profiles ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  monthly_budget  NUMERIC(10,2) NOT NULL DEFAULT 1000.00,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── categories ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#94a3b8',
  emoji       TEXT NOT NULL DEFAULT '📦',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own categories"
  ON categories FOR ALL USING (auth.uid() = user_id);

-- ─── recurring_expenses ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  amount        NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  day_of_month  INT NOT NULL CHECK (day_of_month BETWEEN 1 AND 28),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own recurring expenses"
  ON recurring_expenses FOR ALL USING (auth.uid() = user_id);

-- ─── expenses ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  recurring_id  UUID REFERENCES recurring_expenses(id) ON DELETE SET NULL,
  amount        NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  description   TEXT NOT NULL,
  expense_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  is_favorite   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expenses_user_month_idx
  ON expenses (user_id, expense_date);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own expenses"
  ON expenses FOR ALL USING (auth.uid() = user_id);

-- ─── monthly_savings ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS monthly_savings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year            INT NOT NULL,
  month           INT NOT NULL,
  budget_amount   NUMERIC(10,2) NOT NULL,
  total_spent     NUMERIC(10,2) NOT NULL,
  net_savings     NUMERIC(10,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, year, month)
);

ALTER TABLE monthly_savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own savings"
  ON monthly_savings FOR ALL USING (auth.uid() = user_id);

-- ─── Trigger: create profile + seed categories on signup ────
-- Inlined into one SECURITY DEFINER function so RLS is bypassed
-- for both the profiles and categories inserts.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO categories (user_id, name, color, emoji, sort_order) VALUES
    (NEW.id, 'Lebensmittel', '#4ade80', '🛒', 1),
    (NEW.id, 'Wohnen',       '#60a5fa', '🏠', 2),
    (NEW.id, 'Transport',    '#f97316', '🚗', 3),
    (NEW.id, 'Gesundheit',   '#f43f5e', '💊', 4),
    (NEW.id, 'Freizeit',     '#a78bfa', '🎉', 5),
    (NEW.id, 'Kleidung',     '#fb923c', '👕', 6),
    (NEW.id, 'Restaurant',   '#facc15', '🍽️', 7),
    (NEW.id, 'Sonstiges',    '#94a3b8', '📦', 8);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
