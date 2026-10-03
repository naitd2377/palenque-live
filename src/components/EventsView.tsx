'use client'

import { useEffect, useState } from 'react'
import { Radio, Clock, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/lib/store'
import { toast } from 'sonner'

type EventItem = {
  id: string
  title: string
  description: string
  eventDate: string
  price: number
  currency: string
  coverColor: string
  status: string
  purchased: boolean
  streamUrl: string | null
}

export function EventsView() {
  const { user, openAuth, setView } = useApp()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'LIVE' | 'UPCOMING' | 'ENDED'>('all')
  const [search, setSearch] = useState('')
  const [buyingId, setBuyingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/events', { cache: 'no-store' })
        const data = await res.json()
        if (!cancelled) setEvents(data.events || [])
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

  const filtered = events
    .filter((e) => (filter === 'all' ? true : e.status === filter))
    .filter((e) =>
      search.trim() === '' ? true : (e.title + ' ' + e.description).toLowerCase().includes(search.toLowerCase()),
    )

  async function buy(event: EventItem) {
    if (!user) {
      openAuth('register')
      return
    }
    setBuyingId(event.id)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al crear la sesión de pago')
        return
      }
      // Redirigir a Stripe
      window.location.href = data.url
    } catch {
      toast.error('Error de red')
    } finally {
      setBuyingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Eventos</h1>
        <p className="mt-1 text-muted-foreground">
          Explora los eventos disponibles y compra acceso a las transmisiones en vivo.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="LIVE" className="gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-red-600" />
              En vivo
            </TabsTrigger>
            <TabsTrigger value="UPCOMING">Próximos</TabsTrigger>
            <TabsTrigger value="ENDED">Pasados</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar evento…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 rounded-t-xl bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center text-muted-foreground">
            <Filter className="h-8 w-8" />
            <p>No se encontraron eventos con ese filtro.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const dateStr = new Date(e.eventDate).toLocaleDateString('es-MX', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })
            const timeStr = new Date(e.eventDate).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
            })
            return (
              <Card key={e.id} className="overflow-hidden border-border/60 transition-shadow hover:shadow-lg">
                <div
                  className="relative flex h-40 items-end p-4 text-white"
                  style={{ background: `linear-gradient(135deg, ${e.coverColor} 0%, #1c1917 100%)` }}
                >
                  {e.status === 'LIVE' && (
                    <Badge className="absolute right-3 top-3 bg-red-600 text-white hover:bg-red-700">
                      <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      EN VIVO
                    </Badge>
                  )}
                  {e.status === 'UPCOMING' && (
                    <Badge className="absolute right-3 top-3 bg-amber-500 text-stone-900 hover:bg-amber-400">
                      <Clock className="mr-1 h-3 w-3" />
                      PRÓXIMO
                    </Badge>
                  )}
                  {e.status === 'ENDED' && (
                    <Badge variant="secondary" className="absolute right-3 top-3">
                      Finalizado
                    </Badge>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wide opacity-90">{dateStr}</p>
                    <p className="text-sm font-medium opacity-90">{timeStr}</p>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{e.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{e.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-red-700">${e.price.toFixed(0)}</span>
                    <span className="ml-1 text-xs text-muted-foreground">{e.currency}</span>
                  </div>
                  {e.purchased ? (
                    <Button size="sm" onClick={() => setView({ name: 'event', eventId: e.id })}>
                      Ver
                    </Button>
                  ) : e.status === 'ENDED' ? (
                    <Button size="sm" variant="ghost" disabled>
                      Finalizado
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-red-700 hover:bg-red-800"
                      disabled={buyingId === e.id}
                      onClick={() => buy(e)}
                    >
                      {buyingId === e.id ? 'Redirigiendo...' : 'Comprar'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
