import { createClient } from '@/lib/supabase/server'
import BudgetSetting from '@/components/einstellungen/BudgetSetting'
import CategoryManager from '@/components/einstellungen/CategoryManager'
import RecurringExpenseManager from '@/components/einstellungen/RecurringExpenseManager'
import FavoriteManager from '@/components/einstellungen/FavoriteManager'
import { signOut } from '@/actions/auth'
import { LogOut, Shield } from 'lucide-react'
import type { ExpenseWithCategory, RecurringExpense } from '@/types/database'

export default async function EinstellungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileResult, categoriesResult, recurringResult, favoritesResult] = await Promise.all([
    supabase.from('profiles').select('monthly_budget, email').eq('id', user!.id).single(),
    supabase.from('categories').select('*').eq('user_id', user!.id).order('sort_order'),
    supabase
      .from('recurring_expenses')
      .select('*, category:categories(*)')
      .eq('user_id', user!.id)
      .order('day_of_month'),
    supabase
      .from('expenses')
      .select('*, category:categories(*)')
      .eq('user_id', user!.id)
      .eq('is_favorite', true)
      .order('expense_date', { ascending: false })
      .limit(100),
  ])

  const profile = profileResult.data
  const categories = categoriesResult.data ?? []
  const recurringExpenses = (recurringResult.data ?? []) as RecurringExpense[]

  const allFavorites = (favoritesResult.data ?? []) as ExpenseWithCategory[]
  const seen = new Set<string>()
  const uniqueFavorites: ExpenseWithCategory[] = []
  for (const fav of allFavorites) {
    const key = `${fav.description}::${fav.category?.id ?? 'none'}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueFavorites.push(fav)
    }
  }

  return (
    <div className="px-5 pt-4 pb-6 max-w-2xl mx-auto space-y-6">
      {/* Page heading */}
      <div>
        <span className="text-[10px] font-bold text-[#3f6653] uppercase tracking-widest">Konfiguration</span>
        <h1 className="font-headline text-[1.75rem] font-bold text-[#001939] tracking-tight mt-0.5">Einstellungen</h1>
        {profile?.email && (
          <p className="text-xs text-[#43474f] mt-1">{profile.email}</p>
        )}
      </div>

      {/* Budget section */}
      <section className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-[0.04]">
          <span className="text-8xl">💰</span>
        </div>
        <h2 className="font-headline text-lg font-semibold text-[#001939] mb-4">Monatliches Budget</h2>
        <BudgetSetting budget={profile?.monthly_budget ?? 1000} />
      </section>

      {/* Favorites section */}
      <section className="bg-[#f3f4f5] rounded-2xl p-6">
        <h2 className="font-headline text-lg font-semibold text-[#001939] mb-4">Favoriten</h2>
        <FavoriteManager favorites={uniqueFavorites} categories={categories} />
      </section>

      {/* Categories section */}
      <section className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)]">
        <h2 className="font-headline text-lg font-semibold text-[#001939] mb-4">Kategorien</h2>
        <CategoryManager categories={categories} />
      </section>

      {/* Recurring expenses section */}
      <section className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)]">
        <div className="mb-1">
          <h2 className="font-headline text-lg font-semibold text-[#001939]">Daueraufträge</h2>
          <p className="text-xs text-[#43474f] mt-0.5">
            Werden automatisch zum angegebenen Tag des Monats hinzugefügt.
          </p>
        </div>
        <div className="mt-4">
          <RecurringExpenseManager
            recurringExpenses={recurringExpenses}
            categories={categories}
          />
        </div>
      </section>

      {/* Privacy note */}
      <div className="bg-[#ffdbcb] rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center flex-shrink-0">
          <Shield className="h-5 w-5 text-[#511e00]" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="font-semibold text-[#511e00] text-sm">Privatsphäre &amp; Sicherheit</h3>
          <p className="text-xs text-[#511e00]/75 mt-0.5">
            Deine Daten werden sicher verschlüsselt und niemals ohne deine Zustimmung geteilt.
          </p>
        </div>
      </div>

      {/* Sign out */}
      <form action={signOut}>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-[#c3c6d0]/60 text-[#43474f] font-semibold text-sm hover:bg-[#f3f4f5] transition-colors"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Abmelden
        </button>
      </form>
    </div>
  )
}
