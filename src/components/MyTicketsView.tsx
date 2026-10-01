'use client'

import { useEffect, useState } from 'react'
import { Ticket, Calendar, Clock, Play, Inbox } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useApp } from '@/lib/store'

type Purchase = {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  event: {
    id: string
    title: string
    eventDate: string
    status: string
    coverColor: string
  }
}

export function MyTicketsView() {
  const { user, openAuth, setView } = useApp()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    if (!user) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const res = await fetch('/api/purchases', { cache: 'no-store' })
        const data = await res.json()
        if (!cancelled) setPurchases(data.purchases || [])
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Ticket className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Inicia sesión para ver tus tickets</h2>
        <p className="mt-2 text-muted-foreground">
          Aquí aparecerán todos los eventos a los que hayas comprado acceso.
        </p>
        <Button className="mt-6 bg-red-700 hover:bg-red-800" onClick={() => openAuth('login')}>
          Iniciar sesión
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mis tickets</h1>
        <p className="mt-1 text-muted-foreground">
          Eventos a los que tienes acceso. Haz clic en <span className="font-semibold">Ver</span> para entrar a la transmisión.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center text-muted-foreground">
            <Inbox className="h-10 w-10" />
            <p className="text-lg font-medium">No tienes tickets aún</p>
            <p className="text-sm">Compra acceso a algún evento para verlo aquí.</p>
            <Button className="mt-2" onClick={() => setView({ name: 'events' })}>
              Ver eventos disponibles
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {purchases.map((p) => {
            const dateStr = new Date(p.event.eventDate).toLocaleDateString('es-MX', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })
            const timeStr = new Date(p.event.eventDate).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
            })
            return (
              <Card key={p.id} className="overflow-hidden border-border/60">
                <div
                  className="flex h-24 items-end p-4 text-white"
                  style={{ background: `linear-gradient(135deg, ${p.event.coverColor} 0%, #1c1917 100%)` }}
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide opacity-90">{dateStr}</p>
                    <p className="text-sm font-medium opacity-90">{timeStr}</p>
                  </div>
                  <div className="ml-auto">
                    {p.event.status === 'LIVE' && (
                      <Badge className="bg-red-600 text-white hover:bg-red-700">
                        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                        EN VIVO
                      </Badge>
                    )}
                    {p.event.status === 'UPCOMING' && (
                      <Badge className="bg-amber-500 text-stone-900 hover:bg-amber-400">Próximo</Badge>
                    )}
                    {p.event.status === 'ENDED' && <Badge variant="secondary">Finalizado</Badge>}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{p.event.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Pagaste</p>
                    <p className="font-bold text-red-700">
                      ${p.amount.toFixed(0)} {p.currency}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setView({ name: 'event', eventId: p.event.id })}
                    disabled={p.event.status === 'ENDED'}
                  >
                    <Play className="mr-1 h-4 w-4" /> Ver
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
