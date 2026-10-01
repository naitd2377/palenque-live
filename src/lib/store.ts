'use client'

import { create } from 'zustand'

export type AppUser = {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
}

export type View =
  | { name: 'home' }
  | { name: 'events' }
  | { name: 'event'; eventId: string }
  | { name: 'my-tickets' }
  | { name: 'admin' }
  | { name: 'guide' }

type State = {
  user: AppUser | null
  loadingUser: boolean
  view: View
  authModalOpen: boolean
  authModalMode: 'login' | 'register'

  setUser: (u: AppUser | null) => void
  setLoadingUser: (b: boolean) => void
  setView: (v: View) => void
  openAuth: (mode?: 'login' | 'register') => void
  closeAuth: () => void
}

export const useApp = create<State>((set) => ({
  user: null,
  loadingUser: true,
  view: { name: 'home' },
  authModalOpen: false,
  authModalMode: 'login',

  setUser: (user) => set({ user }),
  setLoadingUser: (loadingUser) => set({ loadingUser }),
  setView: (view) => set({ view }),
  openAuth: (mode = 'login') => set({ authModalOpen: true, authModalMode: mode }),
  closeAuth: () => set({ authModalOpen: false }),
}))
