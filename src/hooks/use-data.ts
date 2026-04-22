'use client'

import useSWR, { useSWRConfig } from 'swr'
import {
  fetchUser,
  fetchProfile,
  fetchExpenses,
  fetchCategories,
  fetchFavorites,
  fetchRecurringExpenses,
  fetchMonthlySavings,
} from '@/lib/queries'

const SWR_OPTS = { revalidateOnFocus: false } as const

export function useUser() {
  return useSWR('user', fetchUser, SWR_OPTS)
}

export function useProfile() {
  const { data: user } = useUser()
  return useSWR(
    user ? ['profile', user.id] : null,
    () => fetchProfile(user!.id),
    SWR_OPTS,
  )
}

export function useExpenses(month: number, year: number) {
  const { data: user } = useUser()
  return useSWR(
    user ? ['expenses', user.id, year, month] : null,
    () => fetchExpenses(user!.id, month, year),
    SWR_OPTS,
  )
}

export function useCategories() {
  const { data: user } = useUser()
  return useSWR(
    user ? ['categories', user.id] : null,
    () => fetchCategories(user!.id),
    SWR_OPTS,
  )
}

export function useFavorites() {
  const { data: user } = useUser()
  return useSWR(
    user ? ['favorites', user.id] : null,
    () => fetchFavorites(user!.id),
    SWR_OPTS,
  )
}

export function useRecurringExpenses() {
  const { data: user } = useUser()
  return useSWR(
    user ? ['recurring', user.id] : null,
    () => fetchRecurringExpenses(user!.id),
    SWR_OPTS,
  )
}

export function useMonthlySavings() {
  const { data: user } = useUser()
  return useSWR(
    user ? ['savings', user.id] : null,
    () => fetchMonthlySavings(user!.id),
    SWR_OPTS,
  )
}

export function useInvalidate() {
  const { mutate } = useSWRConfig()
  return {
    expenses: () => mutate((key) => Array.isArray(key) && key[0] === 'expenses'),
    categories: () => mutate((key) => Array.isArray(key) && key[0] === 'categories'),
    favorites: () => mutate((key) => Array.isArray(key) && key[0] === 'favorites'),
    profile: () => mutate((key) => Array.isArray(key) && key[0] === 'profile'),
    recurring: () => mutate((key) => Array.isArray(key) && key[0] === 'recurring'),
    savings: () => mutate((key) => Array.isArray(key) && key[0] === 'savings'),
  }
}
