'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Calendar, Clock, Radio, Lock, Play, CheckCircle2, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { VideoPlayer } from './VideoPlayer'
import { useApp } from '@/lib/store'
import { toast } from 'sonner'

type EventDetail = {
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
  rtmpUrl: string | null
  streamKey: string | null
}

export function EventView({ eventId }: { eventId: string }) {
  const { user, openAuth, setView } = useApp()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`, { cache: 'no-store' })
        const data = await res.json()
        if (!cancelled) setEvent(data.event ?? null)
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [eventId, user])

  async function buy() {
    if (!user) {
      openAuth('register')
      return
    }
    setBuying(true)
    try {
      const res = await fetch(`/api/events/${eventId}/purchase`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al comprar')
        return
      }
      toast.success('¡Acceso comprado!')
      // Re-fetch to reveal streamUrl
      const refetch = await fetch(`/api/events/${eventId}`, { cache: 'no-store' })
      const rdata = await refetch.json()
      setEvent(rdata.event)
    } catch {
      toast.error('Error de red')
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="mt-4 h-10 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/2" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Evento no encontrado</h2>
        <p className="mt-2 text-muted-foreground">Es posible que haya sido eliminado.</p>
        <Button className="mt-6" onClick={() => setView({ name: 'events' })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a eventos
        </Button>
      </div>
    )
  }

  const dateStr = new Date(event.eventDate).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = new Date(event.eventDate).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const canWatch = event.purchased || user?.role === 'ADMIN'
  const hasStream = !!event.streamUrl

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => setView({ name: 'events' })} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a eventos
      </Button>

      {/* Player area */}
      <div className="mb-4">
        {canWatch && hasStream ? (
          <VideoPlayer src={event.streamUrl!} autoPlay className="shadow-xl" />
        ) : canWatch && !hasStream ? (
          <div
            className="flex aspect-video w-full flex-col items-center justify-center rounded-xl text-white"
            style={{ background: `linear-gradient(135deg, ${event.coverColor} 0%, #1c1917 100%)` }}
          >
            <Radio className="mb-3 h-12 w-12 animate-pulse" />
            <p className="text-xl font-semibold">Transmisión no disponible aún</p>
            <p className="mt-1 text-sm text-white/70">
              {event.status === 'UPCOMING'
                ? `El evento inicia el ${dateStr} a las ${timeStr}`
                : 'El administrador aún no configura la URL del stream.'}
            </p>
          </div>
        ) : (
          <div
            className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-xl text-white"
            style={{ background: `linear-gradient(135deg, ${event.coverColor} 0%, #1c1917 100%)` }}
          >
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
            <Lock className="mb-3 h-12 w-12" />
            <p className="text-xl font-semibold">Contenido bloqueado</p>
            <p className="mt-1 max-w-md text-center text-sm text-white/70">
              Compra acceso a este evento para ver la transmisión en vivo.
            </p>
            <Button
              size="lg"
              className="mt-5 bg-amber-500 text-stone-900 hover:bg-amber-400"
              disabled={buying || event.status === 'ENDED'}
              onClick={buy}
            >
              {buying
                ? 'Procesando…'
                : event.status === 'ENDED'
                  ? 'Evento finalizado'
                  : `Comprar acceso — $${event.price.toFixed(0)} ${event.currency}`}
            </Button>
          </div>
        )}
      </div>

      {/* Event info */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {dateStr}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {timeStr}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {event.status === 'LIVE' && (
                <Badge className="bg-red-600 text-white hover:bg-red-700">
                  <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  EN VIVO
                </Badge>
              )}
              {event.status === 'UPCOMING' && (
                <Badge className="bg-amber-500 text-stone-900 hover:bg-amber-400">Próximo</Badge>
              )}
              {event.status === 'ENDED' && <Badge variant="secondary">Finalizado</Badge>}
              {canWatch && (
                <Badge variant="outline" className="gap-1 border-green-600 text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> Acceso concedido
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-foreground/90">{event.description}</p>

          {/* Admin-only streaming config preview */}
          {user?.role === 'ADMIN' && event.rtmpUrl && (
            <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Shield className="h-4 w-4" /> Configuración de streaming (solo admin)
              </p>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Servidor RTMP:</dt>
                  <dd className="font-mono text-xs">{event.rtmpUrl}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Stream key:</dt>
                  <dd className="font-mono text-xs">{event.streamKey}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">URL pública HLS (visible para compradores):</dt>
                  <dd className="font-mono text-xs break-all">
                    {event.streamUrl || <span className="text-red-600">No configurada — agrégala en el panel admin</span>}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-amber-800/80">
                Configura estas credenciales en la app Larix Broadcaster de tu celular para iniciar la transmisión.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
