'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { requestPasswordReset } from '@/actions/auth'

export default function PasswortVergessenPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await requestPasswordReset(formData)
    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <>
      <header className="flex justify-between items-center px-6 py-5">
        <span className="font-headline font-extrabold text-[#001939] text-xl tracking-tight">
          BudgetPlaner
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="mb-10 relative">
            <div className="absolute -left-6 top-0 w-1 h-14 bg-[#001939] rounded-full opacity-20" />
            <h1 className="font-headline text-[3rem] font-bold leading-tight tracking-tight text-[#001939] mb-3">
              Passwort vergessen
            </h1>
            <p className="text-[#43474f] max-w-[280px]">
              Wir senden dir einen Link zum Zurücksetzen deines Passworts
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.07)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#001939] to-[#002d5e]" />

            {sent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#f0f4f9] flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#001939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <p className="font-headline font-bold text-[#001939] text-lg mb-2">E-Mail gesendet!</p>
                <p className="text-[#43474f] text-sm leading-relaxed">
                  Bitte prüfe dein Postfach und klicke auf den Link in der E-Mail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-br from-[#001939] to-[#002d5e] text-white font-headline font-bold text-lg rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? 'Senden...' : 'Link senden'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/anmelden"
                className="text-sm text-[#43474f] hover:text-[#001939] transition-colors"
              >
                ← Zurück zum Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
