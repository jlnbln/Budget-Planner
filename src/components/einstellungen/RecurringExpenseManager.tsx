'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useInvalidate } from '@/hooks/use-data'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
} from '@/actions/recurring'
import type { Category, RecurringExpense } from '@/types/database'
import { formatEuro } from '@/lib/utils'

interface RecurringExpenseManagerProps {
  recurringExpenses: RecurringExpense[]
  categories: Category[]
}

interface RecurringFormData {
  name: string
  amount: string
  category_id: string
  day_of_month: string
  is_active: boolean
}

const EMPTY_FORM: RecurringFormData = {
  name: '',
  amount: '',
  category_id: '',
  day_of_month: '1',
  is_active: true,
}

export default function RecurringExpenseManager({
  recurringExpenses,
  categories,
}: RecurringExpenseManagerProps) {
  const invalidate = useInvalidate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringExpense | null>(null)
  const [form, setForm] = useState<RecurringFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setSheetOpen(true)
  }

  function openEdit(rec: RecurringExpense) {
    setEditing(rec)
    setForm({
      name: rec.name,
      amount: rec.amount.toString().replace('.', ','),
      category_id: rec.category_id ?? '',
      day_of_month: rec.day_of_month.toString(),
      is_active: rec.is_active,
    })
    setSheetOpen(true)
  }

  async function handleToggleActive(rec: RecurringExpense) {
    try {
      await updateRecurringExpense(rec.id, { is_active: !rec.is_active })
      toast.success(rec.is_active ? 'Deaktiviert' : 'Aktiviert')
      invalidate.recurring()
    } catch {
      toast.error('Fehler')
    }
  }

  async function handleSave() {
    const amount = parseFloat(form.amount.replace(',', '.'))
    const day = parseInt(form.day_of_month)
    if (!form.name.trim() || isNaN(amount) || amount <= 0) {
      toast.error('Bitte Name und Betrag angeben.')
      return
    }
    if (isNaN(day) || day < 1 || day > 28) {
      toast.error('Tag muss zwischen 1 und 28 liegen.')
      return
    }
    setLoading(true)
    try {
      if (editing) {
        await updateRecurringExpense(editing.id, {
          name: form.name.trim(),
          amount,
          category_id: form.category_id || null,
          day_of_month: day,
          is_active: form.is_active,
        })
        toast.success('Aktualisiert')
      } else {
        await createRecurringExpense({
          name: form.name.trim(),
          amount,
          category_id: form.category_id || null,
          day_of_month: day,
        })
        toast.success('Erstellt')
      }
      setSheetOpen(false)
      invalidate.recurring()
      invalidate.expenses()
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      return
    }
    setLoading(true)
    try {
      await deleteRecurringExpense(id)
      toast.success('Gelöscht')
      setDeleteConfirm(null)
      invalidate.recurring()
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setLoading(false)
    }
  }

  const dayLabel = (day: number) =>
    day === 1 ? '1. des Monats' : `${day}. des Monats`

  return (
    <div>
      {recurringExpenses.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Noch keine wiederkehrenden Ausgaben
        </p>
      )}

      <div className="space-y-2">
        {recurringExpenses.map((rec) => {
          const category = categories.find(c => c.id === rec.category_id)
          return (
            <div
              key={rec.id}
              className={`flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 ${!rec.is_active ? 'opacity-50' : ''}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                style={{ backgroundColor: `${category?.color ?? '#94a3b8'}30` }}
              >
                {category?.emoji ?? '📅'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{rec.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatEuro(rec.amount)} · {dayLabel(rec.day_of_month)}
                </p>
              </div>

              {/* Active toggle */}
              <button
                onClick={() => handleToggleActive(rec)}
                className="relative flex-shrink-0"
              >
                <div className={`w-9 h-5 rounded-full transition-colors ${rec.is_active ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rec.is_active ? 'translate-x-4' : ''}`} />
              </button>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rec)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={deleteConfirm === rec.id ? 'destructive' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDelete(rec.id)}
                disabled={loading}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        })}
      </div>

      <Button variant="outline" className="w-full mt-3 gap-2" onClick={openAdd}>
        <Plus className="h-4 w-4" />
        Wiederkehrende Ausgabe hinzufügen
      </Button>

      {deleteConfirm && (
        <p className="text-xs text-destructive text-center mt-2">
          Nochmal tippen zum Bestätigen
        </p>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom">
          <SheetHeader className="px-5 pt-2 pb-4">
            <div className="w-10 h-1 bg-[#e7e8e9] rounded-full mx-auto mb-4" />
            <SheetTitle className="font-headline text-lg font-bold text-[#001939]">
              {editing ? 'Ausgabe bearbeiten' : 'Neue wiederkehrende Ausgabe'}
            </SheetTitle>
          </SheetHeader>
          <div className="px-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Name</label>
              <div className="bg-[#e7e8e9] rounded-t-lg border-b-2 border-transparent focus-within:border-[#001939] transition-colors">
                <Input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="z.B. Miete"
                  className="bg-transparent border-0 shadow-none focus-visible:ring-0 h-12"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Betrag (€)</label>
              <div className="relative bg-[#e7e8e9] rounded-t-lg border-b-2 border-transparent focus-within:border-[#001939] transition-colors">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="bg-transparent border-0 shadow-none focus-visible:ring-0 h-12 pr-8"
                  placeholder="0,00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[#001939]">€</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Kategorie</label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm(f => ({ ...f, category_id: v ?? '' }))}
              >
                <SelectTrigger className="bg-[#e7e8e9] border-0 border-b-2 border-transparent focus:border-[#001939] rounded-t-lg rounded-b-none h-12">
                  <span className={form.category_id ? 'text-[#191c1d]' : 'text-[#747780]'}>
                    {form.category_id === 'none'
                      ? 'Ohne Kategorie'
                      : form.category_id
                      ? (() => { const c = categories.find(x => x.id === form.category_id); return c ? `${c.emoji} ${c.name}` : 'Kategorie wählen...' })()
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
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Tag des Monats (1–28)</label>
              <div className="bg-[#e7e8e9] rounded-t-lg border-b-2 border-transparent focus-within:border-[#001939] transition-colors">
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={form.day_of_month}
                  onChange={(e) => setForm(f => ({ ...f, day_of_month: e.target.value }))}
                  className="bg-transparent border-0 shadow-none focus-visible:ring-0 h-12"
                  placeholder="1"
                />
              </div>
            </div>
            {editing && (
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.is_active}
                    onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  />
                  <div className="w-10 h-6 bg-[#e7e8e9] rounded-full peer-checked:bg-[#001939] transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm text-[#191c1d]">Aktiv</span>
              </label>
            )}
            <div className="pt-2">
              <button
                type="button"
                className="w-full py-4 bg-gradient-to-br from-[#001939] to-[#002d5e] text-white font-headline font-bold text-base rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
