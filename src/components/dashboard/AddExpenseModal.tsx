'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useInvalidate } from '@/hooks/use-data'
import { Plus, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createExpense } from '@/actions/expenses'
import { localDateString } from '@/lib/utils'
import type { Category } from '@/types/database'

interface AddExpenseModalProps {
  categories: Category[]
}

export default function AddExpenseModal({ categories }: AddExpenseModalProps) {
  const invalidate = useInvalidate()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [date, setDate] = useState(() => localDateString())

  function reset() {
    setAmount('')
    setDescription('')
    setCategoryId('')
    setIsFavorite(false)
    setDate(localDateString())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount.replace(',', '.'))
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Bitte gib einen gültigen Betrag ein.')
      return
    }
    setLoading(true)
    try {
      await createExpense({
        amount: parsedAmount,
        description: description.trim(),
        category_id: categoryId || null,
        is_favorite: isFavorite,
        expense_date: date,
      })
      toast.success('Ausgabe hinzugefügt')
      setOpen(false)
      reset()
      invalidate.expenses()
      invalidate.favorites()
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* FAB — pill shape with label */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-40 bg-gradient-to-br from-[#001939] to-[#002d5e] text-white flex items-center gap-2.5 px-6 py-4 rounded-full shadow-[0_12px_32px_-4px_rgba(0,25,57,0.4)] hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
        <span className="font-headline font-bold text-sm tracking-wide">Hinzufügen</span>
      </button>

      {/* Backdrop + bottom sheet modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#001939]/20 backdrop-blur-sm"
            onClick={() => { setOpen(false); reset() }}
          />

          {/* Sheet */}
          <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl px-6 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:mx-4 max-h-[88vh] overflow-y-auto border border-[#c3c6d0]/20">
            {/* Top accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#001939] to-[#002d5e] rounded-t-3xl sm:rounded-t-2xl" />

            {/* Handle (mobile) */}
            <div className="w-10 h-1 bg-[#e7e8e9] rounded-full mx-auto mb-6 sm:hidden" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline text-xl font-bold text-[#001939]">Ausgabe erfassen</h2>
              <button
                className="p-2 rounded-full hover:bg-[#f3f4f5] transition-colors text-[#43474f]"
                onClick={() => { setOpen(false); reset() }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">
                  Betrag (€)
                </label>
                <div className="relative bg-[#e7e8e9] rounded-t-lg border-b-2 border-[#001939] overflow-hidden">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent px-4 py-3.5 text-2xl font-bold text-[#001939] placeholder:text-[#747780] outline-none pr-12"
                    required
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#001939]">€</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">
                  Beschreibung
                </label>
                <div className="bg-[#e7e8e9] rounded-t-lg border-b-2 border-transparent focus-within:border-[#001939] transition-colors">
                  <input
                    type="text"
                    placeholder="Wofür war es?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-transparent px-4 py-3.5 text-[#191c1d] placeholder:text-[#747780] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">
                  Kategorie
                </label>
                <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
                  <SelectTrigger className="bg-[#e7e8e9] border-0 border-b-2 border-transparent focus:border-[#001939] rounded-t-lg rounded-b-none h-12">
                    <span className={categoryId ? 'text-[#191c1d]' : 'text-[#747780]'}>
                      {categoryId
                        ? (() => { const c = categories.find(x => x.id === categoryId); return c ? `${c.emoji} ${c.name}` : 'Kategorie wählen...' })()
                        : 'Kategorie wählen...'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">
                  Datum
                </label>
                <div className="bg-[#e7e8e9] rounded-t-lg border-b-2 border-transparent focus-within:border-[#001939] transition-colors">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent px-4 py-3.5 text-[#191c1d] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Favorite toggle */}
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                  />
                  <div className="w-10 h-6 bg-[#e7e8e9] rounded-full peer-checked:bg-[#001939] transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm text-[#191c1d]">Als Favorit speichern ⭐</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-[#001939] to-[#002d5e] text-white py-4 rounded-xl font-headline font-bold text-base shadow-md hover:opacity-90 active:scale-[0.98] transition-all mt-2 disabled:opacity-60"
              >
                {loading ? 'Speichern...' : 'Ausgabe speichern'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
