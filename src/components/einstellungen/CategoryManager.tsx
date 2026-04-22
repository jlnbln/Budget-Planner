'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useInvalidate } from '@/hooks/use-data'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { createCategory, updateCategory, deleteCategory } from '@/actions/categories'
import type { Category } from '@/types/database'

interface CategoryManagerProps {
  categories: Category[]
}

interface CategoryFormData {
  name: string
  color: string
  emoji: string
}

const DEFAULT_COLORS = [
  '#4ade80', '#60a5fa', '#f97316', '#f43f5e',
  '#a78bfa', '#fb923c', '#facc15', '#94a3b8',
  '#22d3ee', '#f472b6', '#84cc16', '#e879f9',
]

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const invalidate = useInvalidate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryFormData>({ name: '', color: '#4ade80', emoji: '📦' })
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  function openAdd() {
    setEditingCategory(null)
    setForm({ name: '', color: '#4ade80', emoji: '📦' })
    setSheetOpen(true)
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat)
    setForm({ name: cat.name, color: cat.color, emoji: cat.emoji })
    setSheetOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Bitte gib einen Namen ein.')
      return
    }
    setLoading(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, form)
        toast.success('Kategorie aktualisiert')
      } else {
        await createCategory(form)
        toast.success('Kategorie erstellt')
      }
      setSheetOpen(false)
      invalidate.categories()
      invalidate.expenses()
      invalidate.favorites()
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
      await deleteCategory(id)
      toast.success('Kategorie gelöscht')
      setDeleteConfirm(null)
      invalidate.categories()
      invalidate.expenses()
      invalidate.favorites()
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-base"
              style={{ backgroundColor: `${cat.color}30` }}
            >
              {cat.emoji}
            </div>
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="flex-1 font-medium text-sm">{cat.name}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => openEdit(cat)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={deleteConfirm === cat.id ? 'destructive' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDelete(cat.id)}
                disabled={loading}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full mt-3 gap-2"
        onClick={openAdd}
      >
        <Plus className="h-4 w-4" />
        Kategorie hinzufügen
      </Button>

      {deleteConfirm && (
        <p className="text-xs text-destructive text-center mt-2">
          Nochmal tippen zum Bestätigen (Ausgaben werden auf &apos;Ohne Kategorie&apos; gesetzt)
        </p>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom">
          <SheetHeader className="px-5 pt-2 pb-4">
            <div className="w-10 h-1 bg-[#e7e8e9] rounded-full mx-auto mb-4" />
            <SheetTitle className="font-headline text-lg font-bold text-[#001939]">
              {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
            </SheetTitle>
          </SheetHeader>
          <div className="px-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Emoji</label>
              <div className="bg-[#e7e8e9] rounded-t-lg border-b-2 border-transparent focus-within:border-[#001939] transition-colors">
                <Input
                  value={form.emoji}
                  onChange={(e) => setForm(f => ({ ...f, emoji: e.target.value }))}
                  placeholder="z.B. 🛒"
                  className="text-2xl text-center bg-transparent border-0 shadow-none focus-visible:ring-0 h-14"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Name</label>
              <div className="bg-[#e7e8e9] rounded-t-lg border-b-2 border-transparent focus-within:border-[#001939] transition-colors">
                <Input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="z.B. Lebensmittel"
                  className="bg-transparent border-0 shadow-none focus-visible:ring-0 h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Farbe</label>
              <div className="flex flex-wrap gap-3 pt-1">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-10 h-10 rounded-full border-2 transition-transform active:scale-90"
                    style={{
                      backgroundColor: color,
                      borderColor: form.color === color ? '#001939' : 'transparent',
                      transform: form.color === color ? 'scale(1.2)' : undefined,
                    }}
                    onClick={() => setForm(f => ({ ...f, color }))}
                  />
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-10 h-10 rounded-full cursor-pointer border-0 p-0"
                  title="Eigene Farbe"
                />
              </div>
            </div>
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
