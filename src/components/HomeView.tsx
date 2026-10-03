'use client'

import { useEffect, useState } from 'react'
import { Radio, Calendar, Ticket, BookOpen, ArrowRight, Sparkles, Lock, Play, Clock, Users, UserPlus, CreditCard, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

export function HomeView() {
  const { user, openAuth, setView } = useApp()
  const [liveEvents, setLiveEvents] = useState<EventItem[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/events', { cache: 'no-store' })
        const data = await res.json()
        if (cancelled) return
        const events: EventItem[] = data.events || []
        setLiveEvents(events.filter((e) => e.status === 'LIVE'))
        setUpcomingEvents(events.filter((e) => e.status === 'UPCOMING').slice(0, 3))
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-900 via-red-800 to-stone-900 px-6 py-12 text-white sm:px-12 sm:py-20">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3 w-3" />
            Transmisiones en vivo de tu palenque favorito
          </div>
          <h1 className="mb-4 text-4xl font-black leading-tight sm:text-6xl">
            Tu palenque,<br />
            <span className="text-amber-300">en vivo</span> desde donde estés.
          </h1>
          <p className="mb-8 max-w-2xl text-base text-white/80 sm:text-lg">
            Regístrate, compra tu acceso y disfruta las peleas en tiempo real
            desde tu celular o computadora. Calidad HD, sin restricciones,
            sin depender de redes sociales.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-amber-500 text-stone-900 hover:bg-amber-400"
              onClick={() => (user ? setView({ name: 'events' }) : openAuth('register'))}
            >
              {user ? 'Ver eventos' : 'Crear mi cuenta gratis'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              onClick={() => setView({ name: 'guide' })}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Cómo ver las transmisiones
            </Button>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: <Radio className="h-5 w-5" />, label: 'Eventos en vivo', value: liveEvents.length, color: 'text-red-600' },
          { icon: <Calendar className="h-5 w-5" />, label: 'Próximos eventos', value: upcomingEvents.length, color: 'text-amber-600' },
          { icon: <Lock className="h-5 w-5" />, label: 'Acceso privado', value: '100%', color: 'text-stone-700' },
          { icon: <Users className="h-5 w-5" />, label: 'Para clientes', value: '✓', color: 'text-stone-700' },
        ].map((s, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${s.color}`}>
                  {s.icon}
                </span>
                <div>
                  <p className="text-2xl font-bold leading-none">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* LIVE NOW */}
      {liveEvents.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
            </span>
            <h2 className="text-2xl font-bold">Transmitiendo ahora</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* UPCOMING */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Próximos eventos</h2>
          <Button variant="ghost" size="sm" onClick={() => setView({ name: 'events' })}>
            Ver todos <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 rounded-t-xl bg-muted" />
                <CardContent className="p-4">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              No hay eventos próximos. Vuelve pronto.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS — orientado al CLIENTE */}
      <section className="mt-16">
        <h2 className="mb-2 text-center text-2xl font-bold sm:text-3xl">Cómo disfrutar las transmisiones</h2>
        <p className="mb-6 text-center text-muted-foreground">
          Solo 3 pasos para ver tu primer evento en vivo
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: 1,
              title: 'Crea tu cuenta',
              desc: 'Regístrate gratis con tu correo. Solo necesitas un nombre y una contraseña. Sin tarjetas, sin compromisos.',
              icon: <UserPlus className="h-6 w-6" />,
            },
            {
              n: 2,
              title: 'Compra tu acceso',
              desc: 'Elige el evento que quieras ver y paga con tarjeta de crédito/débito de forma segura a través de Stripe. Pago único por evento.',
              icon: <CreditCard className="h-6 w-6" />,
            },
            {
              n: 3,
              title: 'Disfruta en vivo',
              desc: 'El día del evento, entra a "Mis tickets", abre el stream y disfruta la transmisión en HD desde tu celular, tablet o computadora.',
              icon: <Eye className="h-6 w-6" />,
            },
          ].map((step) => (
            <Card key={step.n} className="border-border/60">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-red-700 text-white">
                  {step.icon}
                </div>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-sm font-mono text-red-600">0{step.n}</span>
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="mt-16 rounded-3xl bg-stone-100 p-8 text-center sm:p-12">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">¿Listo para ver tu primer evento?</h2>
          <p className="mb-6 text-muted-foreground">
            Crea tu cuenta gratis hoy y entérate de los próximos eventos.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="bg-red-700 hover:bg-red-800" onClick={() => openAuth('register')}>
              Crear mi cuenta gratis
            </Button>
            <Button size="lg" variant="outline" onClick={() => openAuth('login')}>
              Ya tengo cuenta
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}

function EventCard({ event }: { event: EventItem }) {
  const { user, openAuth, setView } = useApp()
  const [buying, setBuying] = useState(false)

  const dateStr = new Date(event.eventDate).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const timeStr = new Date(event.eventDate).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })

  async function buy() {
    if (!user) {
      openAuth('register')
      return
    }
    setBuying(true)
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
      window.location.href = data.url
    } catch {
      toast.error('Error de red')
    } finally {
      setBuying(false)
    }
  }

  return (
    <Card className="overflow-hidden border-border/60 transition-shadow hover:shadow-lg">
      <div
        className="relative h-40 flex items-end p-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${event.coverColor} 0%, #1c1917 100%)`,
        }}
      >
        {event.status === 'LIVE' && (
          <Badge className="absolute right-3 top-3 bg-red-600 text-white hover:bg-red-700">
            <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            EN VIVO
          </Badge>
        )}
        {event.status === 'UPCOMING' && (
          <Badge className="absolute right-3 top-3 bg-amber-500 text-stone-900 hover:bg-amber-400">
            <Clock className="mr-1 h-3 w-3" />
            PRÓXIMO
          </Badge>
        )}
        <div>
          <p className="text-xs uppercase tracking-wide opacity-90">{dateStr}</p>
          <p className="text-sm font-medium opacity-90">{timeStr}</p>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-red-700">
            ${event.price.toFixed(0)}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">{event.currency}</span>
        </div>
        {event.purchased ? (
          <Button size="sm" onClick={() => setView({ name: 'event', eventId: event.id })}>
            <Play className="mr-1 h-4 w-4" /> Ver ahora
          </Button>
        ) : event.status === 'ENDED' ? (
          <Button size="sm" variant="ghost" disabled>
            Finalizado
          </Button>
        ) : (
          <Button size="sm" className="bg-red-700 hover:bg-red-800" disabled={buying} onClick={buy}>
            {buying ? 'Redirigiendo…' : 'Comprar acceso'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
