import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/cached'
import BottomNav from '@/components/layout/BottomNav'
import DailyRecurringCheck from '@/components/layout/DailyRecurringCheck'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect('/anmelden')
  }

  const initial = (user.email ?? 'U')[0].toUpperCase()

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="sticky top-0 z-40 bg-[#f8f9fa] flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#002d5e] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initial}
          </div>
          <span className="font-headline font-extrabold text-[#001939] text-lg tracking-tight">
            BudgetPlaner
          </span>
        </div>
      </header>

      <DailyRecurringCheck userId={user.id} />

      <main className="flex-1 overflow-y-auto pb-28">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
