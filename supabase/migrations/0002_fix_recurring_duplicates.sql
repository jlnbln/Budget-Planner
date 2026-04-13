-- ============================================================
-- Fix: remove duplicate recurring expenses and prevent future ones
-- ============================================================

-- Step 1: Delete duplicates — keep only the earliest created row
-- for each (recurring_id, expense_date) pair
DELETE FROM expenses
WHERE recurring_id IS NOT NULL
  AND id NOT IN (
    SELECT DISTINCT ON (recurring_id, expense_date) id
    FROM expenses
    WHERE recurring_id IS NOT NULL
    ORDER BY recurring_id, expense_date, created_at ASC
  );

-- Step 2: Add a unique partial index so concurrent inserts can never
-- produce duplicates again (only enforced for recurring-linked expenses)
CREATE UNIQUE INDEX IF NOT EXISTS expenses_recurring_date_unique
  ON expenses (recurring_id, expense_date)
  WHERE recurring_id IS NOT NULL;
