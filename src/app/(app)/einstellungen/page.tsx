'use client'

import { useMemo } from 'react'
import { useProfile, useCategories, useRecurringExpenses, useFavorites } from '@/hooks/use-data'
import BudgetSetting from '@/components/einstellungen/BudgetSetting'
import CategoryManager from '@/components/einstellungen/CategoryManager'
import RecurringExpenseManager from '@/components/einstellungen/RecurringExpenseManager'
import FavoriteManager from '@/components/einstellungen/FavoriteManager'
import { signOut } from '@/actions/auth'
import { LogOut } from 'lucide-react'
import type { ExpenseWithCategory } from '@/types/database'

export default function EinstellungenPage() {
  const { data: profile, isLoading } = useProfile()
  const { data: categories = [] } = useCategories()
  const { data: recurringExpenses = [] } = useRecurringExpenses()
  const { data: allFavorites = [] } = useFavorites()

  const uniqueFavorites = useMemo(() => {
    const seen = new Set<string>()
    const result: ExpenseWithCategory[] = []
    for (const fav of allFavorites) {
      const key = `${fav.description}::${fav.category?.id ?? 'none'}`
      if (!seen.has(key)) { seen.add(key); result.push(fav) }
    }
    return result
  }, [allFavorites])

  return (
    <div className="px-5 pt-4 pb-6 max-w-2xl mx-auto space-y-6">
      <div>
        <span className="text-[10px] font-bold text-[#3f6653] uppercase tracking-widest">Konfiguration</span>
        <h1 className="font-headline text-[1.75rem] font-bold text-[#001939] tracking-tight mt-0.5">Einstellungen</h1>
        {profile?.email && (
          <p className="text-xs text-[#43474f] mt-1">{profile.email}</p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <section className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-[0.04]">
              <span className="text-8xl">💰</span>
            </div>
            <h2 className="font-headline text-lg font-semibold text-[#001939] mb-4">Monatliches Budget</h2>
            <BudgetSetting budget={profile?.monthly_budget ?? 1000} />
          </section>

          <section className="bg-[#f3f4f5] rounded-2xl p-6">
            <h2 className="font-headline text-lg font-semibold text-[#001939] mb-4">Favoriten</h2>
            <FavoriteManager favorites={uniqueFavorites} categories={categories} />
          </section>

          <section className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)]">
            <h2 className="font-headline text-lg font-semibold text-[#001939] mb-4">Kategorien</h2>
            <CategoryManager categories={categories} />
          </section>

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
        </>
      )}

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
