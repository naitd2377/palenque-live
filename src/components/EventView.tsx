'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft, Calendar, Clock, Radio, Lock, Play, CheckCircle2, Shield, Camera, Video, Settings, X, Minus, Plus, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { VideoPlayer } from './VideoPlayer'
import { ChatBox } from './ChatBox'
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
  streamUrl2: string | null
  rtmpUrl2: string | null
  streamKey2: string | null
  streamUrl3: string | null
  rtmpUrl3: string | null
  streamKey3: string | null
  overlayEnabled: boolean
  venueName: string | null
  roundLabel: string | null
  teamRedName: string | null
  teamRedScore: number
  teamGreenName: string | null
  teamGreenScore: number
}

export function EventView({ eventId }: { eventId: string }) {
  const { user, openAuth, setView } = useApp()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState<1 | 2 | 3>(1)
  const [showControl, setShowControl] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`, { cache: 'no-store' })
        const data = await res.json()
        if (!cancelled) setEvent(data.event ?? null)
      } catch { /* ignore */ } finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [eventId, user])

  // Función para actualizar overlay en tiempo real
  const updateOverlay = useCallback(async (field: string, value: any) => {
    if (!event) return
    // Actualizar estado local inmediatamente
    setEvent(prev => prev ? { ...prev, [field]: value } : null)
    // Guardar en el servidor
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
    } catch {}
  }, [event, eventId])

  async function buy() {
    if (!user) { openAuth('register'); return }
    setBuying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Error al crear la sesión de pago'); return }
      window.location.href = data.url
    } catch { toast.error('Error de red') } finally { setBuying(false) }
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
        <Button className="mt-6" onClick={() => setView({ name: 'events' })}><ArrowLeft className="mr-2 h-4 w-4" /> Volver a eventos</Button>
      </div>
    )
  }

  const dateStr = new Date(event.eventDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = new Date(event.eventDate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const canWatch = event.purchased || user?.role === 'ADMIN'
  const cameras = [
    { id: 1, label: 'Cámara 1 (Principal)', url: event.streamUrl },
    { id: 2, label: 'Cámara 2', url: event.streamUrl2 },
    { id: 3, label: 'Cámara 3', url: event.streamUrl3 },
  ].filter((c) => c.url)

  const currentUrl = selectedCamera === 1 ? event.streamUrl : selectedCamera === 2 ? event.streamUrl2 : event.streamUrl3
  const showVideo = canWatch && !!currentUrl

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => setView({ name: 'events' })} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a eventos
      </Button>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div>
          {showVideo && currentUrl ? (
            <div>
              {/* Contenedor relativo para overlays */}
              <div className="relative">
                <VideoPlayer src={currentUrl} autoPlay className="shadow-xl" />

                {/* OVERLAY BANNER */}
                {event.overlayEnabled && (event.venueName || event.roundLabel || event.teamRedName || event.teamGreenName) && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 text-white" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%)' }}>
                    <div className="flex justify-between items-start">
                      {event.venueName && (
                        <span className="rounded bg-black/70 px-3 py-1 text-sm font-bold tracking-wider shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          📍 {event.venueName}
                        </span>
                      )}
                      {event.roundLabel && (
                        <span className="rounded border-2 border-amber-400 bg-red-700 px-4 py-1 text-lg font-black tracking-wider shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          {event.roundLabel}
                        </span>
                      )}
                    </div>
                    {(event.teamRedName || event.teamGreenName) && (
                      <div className="flex items-end justify-between gap-2">
                        <div className="flex items-center gap-2 rounded bg-red-600 px-3 py-1 text-xl font-black shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          <span>{event.teamRedName || 'EQUIPO ROJO'}</span>
                          <span className="bg-white px-2 text-red-600 rounded">{event.teamRedScore}</span>
                        </div>
                        <span className="text-2xl font-black text-amber-400" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>VS</span>
                        <div className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-xl font-black shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                          <span className="bg-white px-2 text-green-600 rounded">{event.teamGreenScore}</span>
                          <span>{event.teamGreenName || 'EQUIPO VERDE'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de control de overlays (SOLO ADMIN) */}
              {user?.role === 'ADMIN' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 bg-stone-900 text-white hover:bg-stone-800 border-stone-700"
                  onClick={() => setShowControl(!showControl)}
                >
                  <Settings className="mr-1 h-3 w-3" />
                  {showControl ? 'Cerrar control' : 'Control de Overlays'}
                </Button>
              )}

              {/* Panel de control flotante (SOLO ADMIN) */}
              {user?.role === 'ADMIN' && showControl && (
                <div className="mt-2 rounded-lg border-2 border-stone-700 bg-stone-900 p-4 text-white shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-400">🎮 CONTROL DE OVERLAYS EN VIVO</h3>
                    <button onClick={() => setShowControl(false)} className="text-stone-400 hover:text-white"><X className="h-4 w-4" /></button>
                  </div>

                  {/* Activar/Desactivar */}
                  <div className="mb-3 flex items-center justify-between rounded bg-stone-800 p-2">
                    <div className="flex items-center gap-2">
                      {event.overlayEnabled ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-stone-500" />}
                      <span className="text-xs font-semibold">Overlay visible</span>
                    </div>
                    <Switch
                      checked={event.overlayEnabled}
                      onCheckedChange={(v) => updateOverlay('overlayEnabled', v)}
                    />
                  </div>

                  {/* Campos de texto */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-stone-400">LUGAR</Label>
                      <Input
                        value={event.venueName || ''}
                        onChange={(e) => updateOverlay('venueName', e.target.value)}
                        placeholder="Ej: Tepatepec"
                        className="h-8 bg-stone-800 border-stone-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-stone-400">RONDA / PELEA</Label>
                      <Input
                        value={event.roundLabel || ''}
                        onChange={(e) => updateOverlay('roundLabel', e.target.value)}
                        placeholder="Ej: PELEA 1"
                        className="h-8 bg-stone-800 border-stone-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Marcador Rojo */}
                  <div className="mt-2 rounded bg-red-950/50 p-2 border border-red-800">
                    <Label className="text-[10px] text-red-400 font-bold">PARTIDO ROJO</Label>
                    <div className="flex gap-2">
                      <Input
                        value={event.teamRedName || ''}
                        onChange={(e) => updateOverlay('teamRedName', e.target.value)}
                        placeholder="Nombre"
                        className="h-8 bg-stone-800 border-stone-700 text-white text-xs flex-1"
                      />
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-stone-800 border-stone-700 text-white"
                          onClick={() => updateOverlay('teamRedScore', Math.max(0, event.teamRedScore - 1))}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-lg font-bold">{event.teamRedScore}</span>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-stone-800 border-stone-700 text-white"
                          onClick={() => updateOverlay('teamRedScore', event.teamRedScore + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Marcador Verde */}
                  <div className="mt-2 rounded bg-green-950/50 p-2 border border-green-800">
                    <Label className="text-[10px] text-green-400 font-bold">PARTIDO VERDE</Label>
                    <div className="flex gap-2">
                      <Input
                        value={event.teamGreenName || ''}
                        onChange={(e) => updateOverlay('teamGreenName', e.target.value)}
                        placeholder="Nombre"
                        className="h-8 bg-stone-800 border-stone-700 text-white text-xs flex-1"
                      />
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-stone-800 border-stone-700 text-white"
                          onClick={() => updateOverlay('teamGreenScore', Math.max(0, event.teamGreenScore - 1))}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-lg font-bold">{event.teamGreenScore}</span>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-stone-800 border-stone-700 text-white"
                          onClick={() => updateOverlay('teamGreenScore', event.teamGreenScore + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-[10px] text-stone-500 text-center">Los cambios se guardan automáticamente</p>
                </div>
              )}

              {/* Selector de cámara */}
              {cameras.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground self-center mr-2">Cámara:</span>
                  {cameras.map((cam) => (
                    <Button key={cam.id} size="sm" variant={selectedCamera === cam.id ? 'default' : 'outline'} className={selectedCamera === cam.id ? 'bg-red-700 hover:bg-red-800' : ''} onClick={() => setSelectedCamera(cam.id as 1 | 2 | 3)}>
                      <Camera className="mr-1 h-3 w-3" />{cam.id === 1 ? 'Principal' : `Cámara ${cam.id}`}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ) : canWatch ? (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${event.coverColor} 0%, #1c1917 100%)` }}>
              <Radio className="mb-3 h-12 w-12 animate-pulse" />
              <p className="text-xl font-semibold">Transmisión no disponible aún</p>
              <p className="mt-1 text-sm text-white/70">{event.status === 'UPCOMING' ? `El evento inicia el ${dateStr} a las ${timeStr}` : 'El administrador aún no configura las URLs de streaming.'}</p>
            </div>
          ) : (
            <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${event.coverColor} 0%, #1c1917 100%)` }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <Lock className="mb-3 h-12 w-12" />
              <p className="text-xl font-semibold">Contenido bloqueado</p>
              <p className="mt-1 max-w-md text-center text-sm text-white/70">Compra acceso a este evento para ver la transmisión en vivo y participar del chat.</p>
              <Button size="lg" className="mt-5 bg-amber-500 text-stone-900 hover:bg-amber-400" disabled={buying} onClick={buy}>
                {buying ? 'Rediridiendo…' : `Comprar acceso — $${event.price.toFixed(0)} ${event.currency}`}
              </Button>
            </div>
          )}
        </div>

        {/* Chat */}
        {canWatch && showVideo && (
          <div className="lg:h-full"><ChatBox eventId={event.id} /></div>
        )}
      </div>

      {/* Event info */}
      <Card className="border-border/60 mt-6">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {dateStr}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {timeStr}</span>
                {cameras.length > 1 && (<span className="flex items-center gap-1 text-red-700"><Video className="h-4 w-4" /> {cameras.length} cámaras disponibles</span>)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {event.status === 'LIVE' && (<Badge className="bg-red-600 text-white hover:bg-red-700"><span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />EN VIVO</Badge>)}
              {event.status === 'UPCOMING' && (<Badge className="bg-amber-500 text-stone-900 hover:bg-amber-400">Próximo</Badge>)}
              {event.status === 'ENDED' && <Badge variant="secondary">Finalizado</Badge>}
              {canWatch && (<Badge variant="outline" className="gap-1 border-green-600 text-green-700"><CheckCircle2 className="h-3 w-3" /> Acceso concedido</Badge>)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-foreground/90">{event.description}</p>

          {user?.role === 'ADMIN' && event.rtmpUrl && (
            <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800"><Shield className="h-4 w-4" /> Configuración de streaming (solo admin)</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-amber-900">📹 CÁMARA 1 (Principal)</p>
                  <dl className="mt-1 grid gap-1 text-xs sm:grid-cols-3">
                    <div><dt className="text-muted-foreground">RTMP:</dt><dd className="font-mono break-all">{event.rtmpUrl}</dd></div>
                    <div><dt className="text-muted-foreground">Key:</dt><dd className="font-mono break-all">{event.streamKey}</dd></div>
                    <div><dt className="text-muted-foreground">HLS:</dt><dd className="font-mono break-all">{event.streamUrl || 'No configurada'}</dd></div>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
