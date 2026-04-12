'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createExpense } from '@/actions/expenses'
import type { ExpenseWithCategory } from '@/types/database'
import { formatEuro } from '@/lib/utils'

interface FavoriteTilesProps {
  favorites: ExpenseWithCategory[]
}

export default function FavoriteTiles({ favorites }: FavoriteTilesProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  if (favorites.length === 0) return null

  async function handleQuickAdd(expense: ExpenseWithCategory) {
    setLoading(expense.id)
    try {
      await createExpense({
        amount: expense.amount,
        description: expense.description,
        category_id: expense.category?.id ?? null,
        is_favorite: true,
      })
      toast.success(`${expense.category?.emoji ?? '💸'} ${expense.description} hinzugefügt`)
      router.refresh()
    } catch {
      toast.error('Fehler beim Hinzufügen')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-headline font-semibold text-[#001939] text-base">Schnellzugriff</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {favorites.slice(0, 4).map((fav) => (
          <button
            key={fav.id}
            onClick={() => handleQuickAdd(fav)}
            disabled={loading === fav.id}
            className="flex flex-col items-start p-4 bg-white rounded-xl hover:opacity-80 active:scale-[0.97] transition-all group border border-transparent hover:border-[#c3c6d0]/20 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.04)] disabled:opacity-50"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: `${fav.category?.color ?? '#beead1'}25` }}
            >
              {fav.category?.emoji ?? '💸'}
            </div>
            <span className="font-semibold text-[#191c1d] text-sm leading-tight truncate w-full text-left">
              {fav.description}
            </span>
            <span className="text-xs text-[#43474f] mt-0.5 font-medium">
              {formatEuro(fav.amount)}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
