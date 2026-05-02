'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updatePassword } from '@/actions/auth'

export default function PasswortZuruecksetzenPage() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      toast.error('Die Passwörter stimmen nicht überein.')
      return
    }

    setLoading(true)
    const result = await updatePassword(formData)
    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
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
              Neues Passwort
            </h1>
            <p className="text-[#43474f] max-w-[280px]">
              Wähle ein neues Passwort für dein Konto
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.07)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#001939] to-[#002d5e]" />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest" htmlFor="password">
                  Neues Passwort
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
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
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full bg-[#e7e8e9] border-0 border-b-2 border-transparent focus:border-[#001939] focus:outline-none rounded-t-lg px-4 py-3.5 text-[#191c1d] placeholder:text-[#747780] transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-br from-[#001939] to-[#002d5e] text-white font-headline font-bold text-lg rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Speichern...' : 'Passwort speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
