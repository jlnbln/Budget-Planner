'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useInvalidate } from '@/hooks/use-data'
import { Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateExpense, deleteExpense } from '@/actions/expenses'
import type { Category, ExpenseWithCategory } from '@/types/database'

interface EditExpenseSheetProps {
  expense: ExpenseWithCategory | null
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditExpenseSheet({
  expense,
  categories,
  open,
  onOpenChange,
}: EditExpenseSheetProps) {
  const invalidate = useInvalidate()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (open && expense) {
      setAmount(expense.amount.toString().replace('.', ','))
      setDescription(expense.description)
      setCategoryId(expense.category?.id ?? '')
      setDate(expense.expense_date)
      setIsFavorite(expense.is_favorite)
      setConfirmDelete(false)
    }
  }, [open, expense])

  function handleOpen(val: boolean) {
    onOpenChange(val)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!expense) return
    const parsedAmount = parseFloat(amount.replace(',', '.'))
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Bitte gib einen gültigen Betrag ein.')
      return
    }
    setLoading(true)
    try {
      await updateExpense(expense.id, {
        amount: parsedAmount,
        description: description.trim(),
        category_id: categoryId || null,
        expense_date: date,
        is_favorite: isFavorite,
      })
      toast.success('Ausgabe aktualisiert')
      onOpenChange(false)
      invalidate.expenses()
      invalidate.favorites()
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!expense) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      await deleteExpense(expense.id)
      toast.success('Ausgabe gelöscht')
      onOpenChange(false)
      invalidate.expenses()
      invalidate.favorites()
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="bottom">
        <SheetHeader className="px-5 pt-2 pb-4">
          <div className="w-10 h-1 bg-[#e7e8e9] rounded-full mx-auto mb-4" />
          <SheetTitle className="font-headline text-lg font-bold text-[#001939]">
            Ausgabe bearbeiten
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSave} className="px-5 space-y-5">
          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">
              Betrag (€)
            </label>
            <div className="relative bg-[#e7e8e9] rounded-t-lg border-b-2 border-[#001939]">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent px-4 py-4 text-2xl font-bold text-[#001939] placeholder:text-[#747780] outline-none pr-12"
                required
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
                  {categoryId === 'none'
                    ? 'Ohne Kategorie'
                    : categoryId
                    ? (() => { const c = categories.find(x => x.id === categoryId); return c ? `${c.emoji} ${c.name}` : 'Kategorie wählen...' })()
                    : 'Kategorie wählen...'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ohne Kategorie</SelectItem>
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
            <span className="text-sm text-[#191c1d]">Als Favorit ⭐</span>
          </label>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-br from-[#001939] to-[#002d5e] text-white font-headline font-bold text-base rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'Speichern...' : 'Speichern'}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={`w-full py-4 font-bold text-base rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 ${
                confirmDelete
                  ? 'bg-[#ba1a1a] text-white'
                  : 'bg-[#ffdad6] text-[#ba1a1a]'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              {confirmDelete ? 'Bestätigen — unwiderruflich löschen?' : 'Ausgabe löschen'}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
