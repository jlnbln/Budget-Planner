'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Star, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { removeFavorite, updateFavoriteTemplate } from '@/actions/expenses'
import type { Category, ExpenseWithCategory } from '@/types/database'
import { formatEuro } from '@/lib/utils'

interface FavoriteManagerProps {
  favorites: ExpenseWithCategory[]
  categories: Category[]
}

export default function FavoriteManager({ favorites, categories }: FavoriteManagerProps) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<ExpenseWithCategory | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  function openEdit(fav: ExpenseWithCategory) {
    setEditing(fav)
    setAmount(fav.amount.toString().replace('.', ','))
    setDescription(fav.description)
    setCategoryId(fav.category?.id ?? '')
    setSheetOpen(true)
  }

  async function handleSave() {
    if (!editing) return
    const parsedAmount = parseFloat(amount.replace(',', '.'))
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Bitte gib einen gültigen Betrag ein.')
      return
    }
    setLoading(true)
    try {
      await updateFavoriteTemplate(
        editing.description,
        editing.category?.id ?? null,
        {
          amount: parsedAmount,
          description: description.trim(),
          category_id: categoryId || null,
        }
      )
      toast.success('Favorit aktualisiert')
      setSheetOpen(false)
      router.refresh()
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(fav: ExpenseWithCategory) {
    const key = `${fav.description}::${fav.category?.id ?? 'none'}`
    if (deleteConfirm !== key) {
      setDeleteConfirm(key)
      return
    }
    setLoading(true)
    try {
      await removeFavorite(fav.description, fav.category?.id ?? null)
      toast.success('Aus Favoriten entfernt')
      setDeleteConfirm(null)
      router.refresh()
    } catch {
      toast.error('Fehler')
    } finally {
      setLoading(false)
    }
  }

  if (favorites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Noch keine Favoriten — beim Erstellen einer Ausgabe &quot;Als Favorit speichern&quot; aktivieren.
      </p>
    )
  }

  return (
    <div>
      <div className="space-y-2">
        {favorites.map((fav) => {
          const key = `${fav.description}::${fav.category?.id ?? 'none'}`
          return (
            <div
              key={key}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${fav.category?.color ?? '#94a3b8'}20` }}
              >
                {fav.category?.emoji ?? '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{fav.description}</p>
                <p className="text-xs text-muted-foreground">
                  {fav.category?.name ?? 'Ohne Kategorie'} · {formatEuro(fav.amount)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(fav)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={deleteConfirm === key ? 'destructive' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemove(fav)}
                  disabled={loading}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {deleteConfirm && (
        <p className="text-xs text-destructive text-center mt-2">
          Nochmal tippen zum Bestätigen
        </p>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom">
          <SheetHeader className="px-5 pt-2 pb-4">
            <div className="w-10 h-1 bg-[#e7e8e9] rounded-full mx-auto mb-4" />
            <SheetTitle className="font-headline text-lg font-bold text-[#001939] flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Favorit bearbeiten
            </SheetTitle>
          </SheetHeader>
          <div className="px-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Betrag (€)</label>
              <div className="relative bg-[#e7e8e9] rounded-t-lg border-b-2 border-[#001939]">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-0 shadow-none focus-visible:ring-0 h-14 text-2xl font-bold text-[#001939] pr-10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#001939]">€</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Beschreibung</label>
              <div className="bg-[#e7e8e9] rounded-t-lg border-b-2 border-transparent focus-within:border-[#001939] transition-colors">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-transparent border-0 shadow-none focus-visible:ring-0 h-12"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Kategorie</label>
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
