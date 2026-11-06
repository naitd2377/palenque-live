'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft, Calendar, Clock, Radio, Lock, CheckCircle2, Shield, Camera, Settings, X, Minus, Plus, Eye, EyeOff } from 'lucide-react'
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
  fightLabel: string | null
  winner: string | null
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

  const updateOverlay = useCallback(async (field: string, value: any) => {
    if (!event) return
    setEvent(prev => prev ? { ...prev, [field]: value } : null)
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
      if (!res.ok) { toast.error(data.error ?? 'Error'); return }
      window.location.href = data.url
    } catch { toast.error('Error de red') } finally { setBuying(false) }
  }

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8"><Skeleton className="mb-4 h-8 w-32" /><Skeleton className="aspect-video w-full rounded-xl" /></div>
  if (!event) return <div className="mx-auto max-w-5xl px-4 py-16 text-center"><h2 className="text-2xl font-bold">Evento no encontrado</h2><Button className="mt-6" onClick={() => setView({ name: 'events' })}>Volver</Button></div>

  const dateStr = new Date(event.eventDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = new Date(event.eventDate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const canWatch = event.purchased || user?.role === 'ADMIN'
  const cameras = [{ id: 1, url: event.streamUrl }, { id: 2, url: event.streamUrl2 }, { id: 3, url: event.streamUrl3 }].filter((c) => c.url)
  const currentUrl = selectedCamera === 1 ? event.streamUrl : selectedCamera === 2 ? event.streamUrl2 : event.streamUrl3
  const showVideo = canWatch && !!currentUrl

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => setView({ name: 'events' })} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a eventos</Button>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div>
          {showVideo && currentUrl ? (
            <div>
              <div className="relative">
                <VideoPlayer src={currentUrl} autoPlay className="shadow-xl" />

                {/* OVERLAY BANNER */}
                {event.overlayEnabled && (event.venueName || event.roundLabel || event.fightLabel || event.teamRedName || event.teamGreenName) && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 text-white" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.7) 100%)' }}>
                    <div className="flex justify-between items-start">
                      {event.venueName && <span className="rounded bg-black/80 px-3 py-1 text-sm font-bold tracking-wider shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>📍 {event.venueName}</span>}
                      <div className="flex flex-col items-end gap-1">
                                                 {event.roundLabel && <span className="rounded border-2 border-amber-400 bg-red-700 px-3 py-0.5 text-sm font-black tracking-wider shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>RONDA {event.roundLabel}</span>}
                        {event.fightLabel && <span className="rounded border-2 border-amber-400 bg-red-700 px-3 py-0.5 text-sm font-black tracking-wider shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>PELEA {event.fightLabel}</span>}
                                                
                      </div>
                    </div>
                    {(event.teamRedName || event.teamGreenName) && (
                      <div className="flex items-end justify-between gap-2">
                        <div className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-xl font-black shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}><span>{event.teamRedName || 'ROJO'}</span><span className="bg-white px-3 text-2xl text-red-600 rounded">{event.teamRedScore}</span></div>
                        <div className="flex flex-col items-center"><span className="text-xs font-bold text-amber-400">PUNTOS</span><span className="text-2xl font-black text-amber-400">VS</span></div>
                        <div className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-xl font-black shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}><span className="bg-white px-3 text-2xl text-green-600 rounded">{event.teamGreenScore}</span><span>{event.teamGreenName || 'VERDE'}</span></div>
                      </div>
                    )}
                  </div>
                )}

                {/* ANUNCIO DE GANADOR */}
                {event.overlayEnabled && event.winner && (event.winner === 'red' || event.winner === 'green') && (
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <div className="flex flex-col items-center rounded-3xl border-4 border-amber-400 px-12 py-8 shadow-2xl" style={{ background: event.winner === 'red' ? 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)' : 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)', animation: 'winnerPop 0.5s ease-out' }}>
                      <span className="text-amber-400 text-sm font-black tracking-widest mb-2">🏆 GANADOR 🏆</span>
                      <span className="text-white text-5xl font-black tracking-wider">{event.winner === 'red' ? (event.teamRedName || 'PARTIDO ROJO') : (event.teamGreenName || 'PARTIDO VERDE')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel de Control Admin */}
              {user?.role === 'ADMIN' && (
                <Button size="sm" variant="outline" className="mt-2 bg-stone-900 text-white hover:bg-stone-800 border-stone-700" onClick={() => setShowControl(!showControl)}>
                  <Settings className="mr-1 h-3 w-3" /> {showControl ? 'Cerrar control' : 'Control de Overlays'}
                </Button>
              )}

              {user?.role === 'ADMIN' && showControl && (
                <div className="mt-2 rounded-lg border-2 border-stone-700 bg-stone-900 p-4 text-white shadow-xl">
                  <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-amber-400">🎮 CONTROL EN VIVO</h3><button onClick={() => setShowControl(false)} className="text-stone-400 hover:text-white"><X className="h-4 w-4" /></button></div>
                  
                  <div className="mb-3 flex items-center justify-between rounded bg-stone-800 p-2">
                    <div className="flex items-center gap-2">{event.overlayEnabled ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-stone-500" />}<span className="text-xs font-semibold">Overlay visible</span></div>
                    <Switch checked={event.overlayEnabled} onCheckedChange={(v) => updateOverlay('overlayEnabled', v)} />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div><Label className="text-[10px] text-stone-400">LUGAR</Label><Input value={event.venueName || ''} onChange={(e) => updateOverlay('venueName', e.target.value)} className="h-8 bg-stone-800 border-stone-700 text-white text-xs" /></div>
                    <div><Label className="text-[10px] text-stone-400">RONDA</Label><Input value={event.roundLabel || ''} onChange={(e) => updateOverlay('roundLabel', e.target.value)} className="h-8 bg-stone-800 border-stone-700 text-white text-xs" /></div>
                    <div><Label className="text-[10px] text-stone-400">PELEA</Label><Input value={event.fightLabel || ''} onChange={(e) => updateOverlay('fightLabel', e.target.value)} className="h-8 bg-stone-800 border-stone-700 text-white text-xs" /></div>
                  </div>

                  <div className="mt-2 rounded bg-red-950/50 p-2 border border-red-800">
                    <div className="flex gap-2">
                      <Input value={event.teamRedName || ''} onChange={(e) => updateOverlay('teamRedName', e.target.value)} placeholder="Nombre Rojo" className="h-8 bg-stone-800 border-stone-700 text-white text-xs flex-1" />
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-stone-800 border-stone-700 text-white" onClick={() => updateOverlay('teamRedScore', Math.max(0, event.teamRedScore - 1))}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-lg font-bold">{event.teamRedScore}</span>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-stone-800 border-stone-700 text-white" onClick={() => updateOverlay('teamRedScore', event.teamRedScore + 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>

                  <div className="mt-2 rounded bg-green-950/50 p-2 border border-green-800">
                    <div className="flex gap-2">
                      <Input value={event.teamGreenName || ''} onChange={(e) => updateOverlay('teamGreenName', e.target.value)} placeholder="Nombre Verde" className="h-8 bg-stone-800 border-stone-700 text-white text-xs flex-1" />
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-stone-800 border-stone-700 text-white" onClick={() => updateOverlay('teamGreenScore', Math.max(0, event.teamGreenScore - 1))}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-lg font-bold">{event.teamGreenScore}</span>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-stone-800 border-stone-700 text-white" onClick={() => updateOverlay('teamGreenScore', event.teamGreenScore + 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>

                  {/* Botones GANADOR */}
                  <div className="mt-3 border-t border-stone-700 pt-3">
                    <Label className="text-[10px] text-stone-400 mb-2 block">DECLARAR GANADOR</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" className={`h-10 ${event.winner === 'red' ? 'bg-red-600 text-white' : 'bg-stone-800 border border-red-800 text-red-400'}`} onClick={() => updateOverlay('winner', event.winner === 'red' ? '' : 'red')}>🏆 {event.teamRedName || 'ROJO'} GANA</Button>
                      <Button size="sm" className={`h-10 ${event.winner === 'green' ? 'bg-green-600 text-white' : 'bg-stone-800 border border-green-800 text-green-400'}`} onClick={() => updateOverlay('winner', event.winner === 'green' ? '' : 'green')}>🏆 {event.teamGreenName || 'VERDE'} GANA</Button>
                    </div>
                    {event.winner && <Button size="sm" variant="outline" className="mt-2 w-full bg-stone-800 border-stone-600 text-stone-300" onClick={() => updateOverlay('winner', '')}>✕ Quitar ganador</Button>}
                  </div>
                </div>
              )}

              {cameras.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground self-center mr-2">Cámara:</span>
                  {cameras.map((cam) => (<Button key={cam.id} size="sm" variant={selectedCamera === cam.id ? 'default' : 'outline'} className={selectedCamera === cam.id ? 'bg-red-700 hover:bg-red-800' : ''} onClick={() => setSelectedCamera(cam.id as 1 | 2 | 3)}><Camera className="mr-1 h-3 w-3" />{cam.id === 1 ? 'Principal' : `Cámara ${cam.id}`}</Button>))}
                </div>
              )}
            </div>
          ) : canWatch ? (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${event.coverColor} 0%, #1c1917 100%)` }}><Radio className="mb-3 h-12 w-12 animate-pulse" /><p className="text-xl font-semibold">Transmisión no disponible</p></div>
          ) : (
            <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${event.coverColor} 0%, #1c1917 100%)` }}>
              <Lock className="mb-3 h-12 w-12" /><p className="text-xl font-semibold">Contenido bloqueado</p>
              <Button size="lg" className="mt-5 bg-amber-500 text-stone-900" disabled={buying} onClick={buy}>{buying ? 'Redirigiendo…' : `Comprar — $${event.price.toFixed(0)} ${event.currency}`}</Button>
            </div>
          )}
        </div>

        {canWatch && showVideo && <div className="lg:h-full"><ChatBox eventId={event.id} /></div>}
      </div>

      <Card className="border-border/60 mt-6">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {dateStr}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {timeStr}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {event.status === 'LIVE' && <Badge className="bg-red-600 text-white"><span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />EN VIVO</Badge>}
              {event.status === 'UPCOMING' && <Badge className="bg-amber-500 text-stone-900">Próximo</Badge>}
              {canWatch && <Badge variant="outline" className="gap-1 border-green-600 text-green-700"><CheckCircle2 className="h-3 w-3" /> Acceso concedido</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-foreground/90">{event.description}</p>
          {user?.role === 'ADMIN' && event.rtmpUrl && (<div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4"><p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800"><Shield className="h-4 w-4" /> Config (solo admin)</p><div className="text-xs font-mono break-all">{event.rtmpUrl} / {event.streamKey}</div></div>)}
        </CardContent>
      </Card>
    </div>
  )
}
