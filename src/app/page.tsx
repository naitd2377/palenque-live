'use client'

import { useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuthModal } from '@/components/AuthModal'
import { HomeView } from '@/components/HomeView'
import { EventsView } from '@/components/EventsView'
import { EventView } from '@/components/EventView'
import { MyTicketsView } from '@/components/MyTicketsView'
import { AdminView } from '@/components/AdminView'
import { GuideView } from '@/components/GuideView'
import { useApp } from '@/lib/store'
import { Toaster as SonnerToaster } from 'sonner'

export default function Home() {
  const { user, loadingUser, view, setUser, setLoadingUser } = useApp()

  // Restore session on first load
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        if (!cancelled) setUser(data.user ?? null)
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoadingUser(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [setUser, setLoadingUser])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SonnerToaster position="top-center" richColors />

      <Navbar />

      <main className="flex-1">
        {view.name === 'home' && <HomeView />}
        {view.name === 'events' && <EventsView />}
        {view.name === 'event' && <EventView eventId={view.eventId} />}
        {view.name === 'my-tickets' && <MyTicketsView />}
        {view.name === 'admin' && <AdminView />}
        {view.name === 'guide' && <GuideView />}
      </main>

      <Footer />

      <AuthModal />
    </div>
  )
}
