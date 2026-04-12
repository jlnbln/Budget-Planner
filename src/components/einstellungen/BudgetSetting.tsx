'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateBudget } from '@/actions/settings'
import { formatEuro } from '@/lib/utils'

interface BudgetSettingProps {
  budget: number
}

export default function BudgetSetting({ budget }: BudgetSettingProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(budget.toString().replace('.', ','))
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    const amount = parseFloat(value.replace(',', '.'))
    if (isNaN(amount) || amount <= 0) {
      toast.error('Bitte gib einen gültigen Betrag ein.')
      return
    }
    setLoading(true)
    try {
      await updateBudget(amount)
      toast.success('Budget aktualisiert')
      setEditing(false)
      router.refresh()
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setValue(budget.toString().replace('.', ','))
    setEditing(false)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-sm text-muted-foreground mb-2">Monatliches Budget</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
            <Input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="pl-7 text-xl font-bold"
              autoFocus
            />
          </div>
          <Button size="icon" onClick={handleSave} disabled={loading}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{formatEuro(budget)}</span>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            Bearbeiten
          </Button>
        </div>
      )}
    </div>
  )
}
