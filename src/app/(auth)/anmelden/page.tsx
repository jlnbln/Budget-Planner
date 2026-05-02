'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { signIn } from '@/actions/auth'

export default function AnmeldenPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await signIn(formData)
    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-5">
        <span className="font-headline font-extrabold text-[#001939] text-xl tracking-tight">
          BudgetPlaner
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Editorial heading */}
          <div className="mb-10 relative">
            <div className="absolute -left-6 top-0 w-1 h-14 bg-[#001939] rounded-full opacity-20" />
            <h1 className="font-headline text-[3rem] font-bold leading-tight tracking-tight text-[#001939] mb-3">
              Willkommen zurück
            </h1>
            <p className="text-[#43474f] max-w-[260px]">
              Logge dich ein, um deine Finanzen zu verwalten
            </p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.07)] relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#001939] to-[#002d5e]" />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest" htmlFor="email">
                  E-Mail Adresse
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@beispiel.de"
                    required
                    autoComplete="email"
                    className="w-full bg-[#e7e8e9] border-0 border-b-2 border-transparent focus:border-[#001939] focus:outline-none rounded-t-lg px-4 py-3.5 text-[#191c1d] placeholder:text-[#747780] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest" htmlFor="password">
                    Passwort
                  </label>
                  <Link href="/passwort-vergessen" className="text-[10px] font-semibold text-[#001939] hover:underline tracking-wide">
                    Vergessen?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full bg-[#e7e8e9] border-0 border-b-2 border-transparent focus:border-[#001939] focus:outline-none rounded-t-lg px-4 py-3.5 text-[#191c1d] placeholder:text-[#747780] transition-colors"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-br from-[#001939] to-[#002d5e] text-white font-headline font-bold text-lg rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Anmelden...' : 'Anmelden'}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#c3c6d0]/40" />
              <span className="text-xs text-[#747780] font-medium">oder</span>
              <div className="h-px flex-1 bg-[#c3c6d0]/40" />
            </div>

            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-[#43474f] mb-4 text-sm">Noch kein Konto?</p>
              <Link
                href="/registrieren"
                className="block w-full py-3 border border-[#c3c6d0]/50 text-[#001939] font-semibold rounded-xl hover:bg-[#f3f4f5] transition-colors text-sm"
              >
                Konto erstellen
              </Link>
            </div>
          </div>

          {/* Trust badge */}
          <div className="mt-10 flex items-center justify-center gap-5 opacity-40">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#43474f]">
              🔒 Sicher &amp; Verschlüsselt
            </span>
            <div className="w-px h-4 bg-[#c3c6d0]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#43474f]">
              🏦 Deutsche Präzision
            </span>
          </div>
        </div>
      </main>
    </>
  )
}
