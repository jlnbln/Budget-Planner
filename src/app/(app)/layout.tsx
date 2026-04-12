import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { applyRecurringExpenses, checkAndFinalizeMonths } from '@/lib/recurring'
import BottomNav from '@/components/layout/BottomNav'
import { Bell } from 'lucide-react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/anmelden')
  }

  // Fetch user's profile for budget
  const { data: profile } = await supabase
    .from('profiles')
    .select('monthly_budget, email')
    .eq('id', user.id)
    .single()

  const budget = profile?.monthly_budget ?? 1000
  const initial = (profile?.email ?? user.email ?? 'U')[0].toUpperCase()

  // Background tasks: apply recurring expenses + finalize past months
  try {
    await applyRecurringExpenses(user.id)
    await checkAndFinalizeMonths(user.id, budget)
  } catch {
    // Non-critical — don't block the page
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#f8f9fa] flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#002d5e] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initial}
          </div>
          <span className="font-headline font-extrabold text-[#001939] text-lg tracking-tight">
            BudgetPlaner
          </span>
        </div>
        <button className="text-[#43474f] hover:opacity-70 transition-opacity p-1" aria-label="Benachrichtigungen">
          <Bell className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-28">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
