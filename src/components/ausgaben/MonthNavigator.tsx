'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthYear } from '@/lib/utils'

interface MonthNavigatorProps {
  month: number
  year: number
}

export default function MonthNavigator({ month, year }: MonthNavigatorProps) {
  const router = useRouter()
  const now = new Date()
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear()

  function navigate(direction: -1 | 1) {
    let newMonth = month + direction
    let newYear = year
    if (newMonth === 0) { newMonth = 12; newYear-- }
    if (newMonth === 13) { newMonth = 1; newYear++ }
    router.push(`/ausgaben?monat=${newMonth}&jahr=${newYear}`)
  }

  return (
    <div className="flex items-center justify-between bg-[#f3f4f5] rounded-xl px-4 py-4 h-full">
      <button
        onClick={() => navigate(-1)}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#e7e8e9] transition-colors text-[#001939]"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <span className="font-headline font-bold text-[#001939] capitalize">
        {formatMonthYear(month, year)}
      </span>
      <button
        onClick={() => navigate(1)}
        disabled={isCurrentMonth}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#e7e8e9] transition-colors text-[#001939] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  )
}
