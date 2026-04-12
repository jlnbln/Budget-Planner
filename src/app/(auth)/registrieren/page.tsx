'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { signUp } from '@/actions/auth'

export default function RegistrierenPage() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string
    if (password !== confirm) {
      toast.error('Die Passwörter stimmen nicht überein.')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      toast.error('Das Passwort muss mindestens 6 Zeichen lang sein.')
      setLoading(false)
      return
    }
    const result = await signUp(formData)
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
          {/* Heading */}
          <div className="mb-10 relative">
            <div className="absolute -left-6 top-0 w-1 h-14 bg-[#001939] rounded-full opacity-20" />
            <h1 className="font-headline text-[3rem] font-bold leading-tight tracking-tight text-[#001939] mb-3">
              Konto erstellen
            </h1>
            <p className="text-[#43474f] max-w-[260px]">
              Registriere dich, um deine Finanzen zu tracken
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.07)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#001939] to-[#002d5e]" />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest" htmlFor="email">
                  E-Mail Adresse
                </label>
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest" htmlFor="password">
                  Passwort
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mindestens 6 Zeichen"
                  required
                  autoComplete="new-password"
                  className="w-full bg-[#e7e8e9] border-0 border-b-2 border-transparent focus:border-[#001939] focus:outline-none rounded-t-lg px-4 py-3.5 text-[#191c1d] placeholder:text-[#747780] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest" htmlFor="confirm">
                  Passwort bestätigen
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full bg-[#e7e8e9] border-0 border-b-2 border-transparent focus:border-[#001939] focus:outline-none rounded-t-lg px-4 py-3.5 text-[#191c1d] placeholder:text-[#747780] transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-br from-[#001939] to-[#002d5e] text-white font-headline font-bold text-lg rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
                >
                  {loading ? 'Registrieren...' : 'Konto erstellen'}
                </button>
              </div>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#c3c6d0]/40" />
              <span className="text-xs text-[#747780] font-medium">oder</span>
              <div className="h-px flex-1 bg-[#c3c6d0]/40" />
            </div>

            <div className="mt-6 text-center">
              <p className="text-[#43474f] mb-4 text-sm">Bereits ein Konto?</p>
              <Link
                href="/anmelden"
                className="block w-full py-3 border border-[#c3c6d0]/50 text-[#001939] font-semibold rounded-xl hover:bg-[#f3f4f5] transition-colors text-sm"
              >
                Anmelden
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
