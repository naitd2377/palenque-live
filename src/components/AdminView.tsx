'use client'

import { useEffect, useState } from 'react'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Radio,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
  // Cámara 1
  streamUrl: string | null
  rtmpUrl: string | null
  streamKey: string | null
  // Cámara 2
  streamUrl2: string | null
  rtmpUrl2: string | null
  streamKey2: string | null
  // Cámara 3
  streamUrl3: string | null
  rtmpUrl3: string | null
  streamKey3: string | null
}

type Stats = {
  totalUsers: number
  totalClients: number
  totalEvents: number
  liveEvents: number
  upcomingEvents: number
  totalPurchases: number
  salesLast7Days: number
  revenue: number
}

type UserRow = {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
  createdAt: string
  purchaseCount: number
  totalSpent: number
}

export function AdminView() {
  const { user, setView } = useApp()
  const [stats, setStats] = useState<Stats | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [creating, setCreating] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const [sRes, eRes, uRes] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }),
        fetch('/api/events', { cache: 'no-store' }),
        fetch('/api/admin/users', { cache: 'no-store' }),
      ])
      const [s, e, u] = await Promise.all([sRes.json(), eRes.json(), uRes.json()])
      setStats(s.stats)
      setEvents(e.events || [])
      setUsers(u.users || [])
    } catch (err) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Acceso restringido</h2>
        <p className="mt-2 text-muted-foreground">Solo los administradores pueden ver esta página.</p>
        <Button className="mt-6" onClick={() => setView({ name: 'home' })}>
          Volver al inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Panel de administrador</h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona eventos, supervisa usuarios y revisa tus ingresos.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Ingresos totales"
          value={stats ? `$${stats.revenue.toFixed(0)}` : '—'}
          color="bg-green-700"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Ventas (7 días)"
          value={stats ? String(stats.salesLast7Days) : '—'}
          color="bg-amber-600"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Clientes"
          value={stats ? String(stats.totalClients) : '—'}
          color="bg-stone-700"
        />
        <StatCard
          icon={<Radio className="h-5 w-5" />}
          label="Eventos en vivo"
          value={stats ? String(stats.liveEvents) : '—'}
          color="bg-red-700"
        />
      </div>

      <Tabs defaultValue="events">
        <TabsList className="mb-4">
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        {/* EVENTS TAB */}
        <TabsContent value="events">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Eventos ({events.length})</h2>
            <Button className="bg-red-700 hover:bg-red-800" onClick={() => setCreating(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nuevo evento
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <AdminEventCard
                key={e.id}
                event={e}
                onEdit={() => setEditingEvent(e)}
                onChanged={refresh}
              />
            ))}
          </div>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users">
          <h2 className="mb-4 text-xl font-semibold">Usuarios registrados ({users.length})</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="text-center">Compras</TableHead>
                      <TableHead className="text-right">Total gastado</TableHead>
                      <TableHead>Registro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell className="text-sm">{u.phone || '—'}</TableCell>
                        <TableCell>
                          {u.role === 'ADMIN' ? (
                            <Badge className="bg-red-700 text-white hover:bg-red-800">Admin</Badge>
                          ) : (
                            <Badge variant="secondary">Cliente</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{u.purchaseCount}</TableCell>
                        <TableCell className="text-right font-medium text-green-700">
                          ${u.totalSpent.toFixed(0)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString('es-MX')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit dialog */}
      {(creating || editingEvent) && (
        <EventFormDialog
          event={editingEvent}
          onClose={() => {
            setCreating(false)
            setEditingEvent(null)
          }}
          onSaved={() => {
            setCreating(false)
            setEditingEvent(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${color}`}>
            {icon}
          </span>
          <div>
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AdminEventCard({
  event,
  onEdit,
  onChanged,
}: {
  event: EventItem
  onEdit: () => void
  onChanged: () => void
}) {
  const [showKeys, setShowKeys] = useState(false)
  const [updating, setUpdating] = useState(false)

  async function cycleStatus() {
    setUpdating(true)
    const order = ['UPCOMING', 'LIVE', 'ENDED', 'UPCOMING'] as const
    const idx = order.indexOf(event.status as any)
    const next = order[(idx + 1) % order.length]
    try {
      const res = await fetch(`/api/events/${event.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error ?? 'Error al actualizar estado')
      } else {
        toast.success(`Estado: ${next === 'LIVE' ? 'EN VIVO' : next === 'ENDED' ? 'Finalizado' : 'Próximo'}`)
        onChanged()
      }
    } finally {
      setUpdating(false)
    }
  }

  async function del() {
    if (!confirm(`¿Eliminar el evento "${event.title}"? Esta acción no se puede deshacer.`)) return
    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Evento eliminado')
      onChanged()
    } else {
      toast.error('Error al eliminar')
    }
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado`)
  }

  const dateStr = new Date(event.eventDate).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card className="overflow-hidden border-border/60">
      <div
        className="flex h-20 items-end p-3 text-white"
        style={{ background: `linear-gradient(135deg, ${event.coverColor} 0%, #1c1917 100%)` }}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-xs opacity-90">{dateStr}</span>
          {event.status === 'LIVE' && (
            <Badge className="bg-red-600 text-white hover:bg-red-700">
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              LIVE
            </Badge>
          )}
          {event.status === 'UPCOMING' && (
            <Badge className="bg-amber-500 text-stone-900 hover:bg-amber-400">Próximo</Badge>
          )}
          {event.status === 'ENDED' && <Badge variant="secondary">Finalizado</Badge>}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="line-clamp-1 font-semibold">{event.title}</h3>
        <p className="mt-1 text-lg font-bold text-red-700">
          ${event.price.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">{event.currency}</span>
        </p>

        {/* Stream keys */}
        <div className="mt-3 space-y-1 rounded-md bg-muted/50 p-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">RTMP:</span>
            <code className="truncate font-mono">{event.rtmpUrl || '—'}</code>
            {event.rtmpUrl && (
              <button
                onClick={() => copy(event.rtmpUrl!, 'RTMP')}
                className="text-red-700 hover:text-red-900"
                title="Copiar"
              >
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Key:</span>
            <code className="truncate font-mono">{showKeys ? event.streamKey : '••••••••'}</code>
            <div className="flex gap-1">
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="text-muted-foreground hover:text-foreground"
                title={showKeys ? 'Ocultar' : 'Mostrar'}
              >
                {showKeys ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
              <button
                onClick={() => copy(event.streamKey!, 'Stream key')}
                className="text-red-700 hover:text-red-900"
                title="Copiar"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">HLS:</span>
            <code className="truncate font-mono text-[10px]">{event.streamUrl || 'No configurada'}</code>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={onEdit}>
            <Pencil className="mr-1 h-3 w-3" /> Editar
          </Button>
          <Button size="sm" variant="outline" onClick={cycleStatus} disabled={updating}>
            {event.status === 'UPCOMING' ? 'Iniciar' : event.status === 'LIVE' ? 'Terminar' : 'Reabrir'}
          </Button>
          <Button size="sm" variant="ghost" className="text-red-700 hover:bg-red-50" onClick={del}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EventFormDialog({
  event,
  onClose,
  onSaved,
}: {
  event: EventItem | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!event
  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [eventDate, setEventDate] = useState(
    event ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
  )
  const [price, setPrice] = useState(event?.price ?? 100)
  const [streamUrl, setStreamUrl] = useState(event?.streamUrl ?? '')
  const [streamUrl2, setStreamUrl2] = useState(event?.streamUrl2 ?? '')
  const [streamUrl3, setStreamUrl3] = useState(event?.streamUrl3 ?? '')
  const [rtmpUrl, setRtmpUrl] = useState(event?.rtmpUrl ?? 'rtmp://tu-servidor.com/live')
  const [rtmpUrl2, setRtmpUrl2] = useState(event?.rtmpUrl2 ?? 'rtmp://tu-servidor.com/live')
  const [rtmpUrl3, setRtmpUrl3] = useState(event?.rtmpUrl3 ?? 'rtmp://tu-servidor.com/live')
  const [streamKey, setStreamKey] = useState(event?.streamKey ?? '')
  const [streamKey2, setStreamKey2] = useState(event?.streamKey2 ?? '')
  const [streamKey3, setStreamKey3] = useState(event?.streamKey3 ?? '')
  const [coverColor, setCoverColor] = useState(event?.coverColor ?? '#b91c1c')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!title || !description || !eventDate) {
      toast.error('Completa título, descripción y fecha')
      return
    }
    setSaving(true)
    try {
      const url = isEdit ? `/api/events/${event!.id}` : '/api/events'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
          title,
          description,
          eventDate: new Date(eventDate).toISOString(),
          price: Number(price),
          streamUrl,
          streamUrl2,
          streamUrl3,
          rtmpUrl,
          rtmpUrl2,
          rtmpUrl3,
          streamKey: streamKey || undefined,
          streamKey2: streamKey2 || undefined,
          streamKey3: streamKey3 || undefined,
          coverColor,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error ?? 'Error al guardar')
      } else {
        toast.success(isEdit ? 'Evento actualizado' : 'Evento creado')
        onSaved()
      }
    } finally {
      setSaving(false)
    }
  }

  const colors = ['#b91c1c', '#92400e', '#7c2d12', '#991b1b', '#525252', '#166534', '#1e3a8a', '#581c87']

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los detalles del evento. Los cambios son inmediatos.'
              : 'Completa los datos del nuevo evento. Se creará con estado "Próximo".'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ev-title">Título</Label>
            <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Sábado Estelar" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ev-desc">Descripción</Label>
            <Textarea
              id="ev-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el evento, número de peleas, horario, etc."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ev-date">Fecha y hora</Label>
              <Input
                id="ev-date"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-price">Precio ({event?.currency ?? 'MXN'})</Label>
              <Input
                id="ev-price"
                type="number"
                min="0"
                step="10"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color de portada</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCoverColor(c)}
                  className={`h-8 w-8 rounded-full border-2 ${coverColor === c ? 'border-foreground' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

                    {/* Cámara 1 */}
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
            <p className="mb-2 text-sm font-semibold text-amber-900">📹 Cámara 1 (Principal)</p>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="ev-rtmp" className="text-xs">Servidor RTMP</Label>
                <Input id="ev-rtmp" value={rtmpUrl} onChange={(e) => setRtmpUrl(e.target.value)} className="font-mono text-xs" placeholder="rtmp://tu-servidor.com/live" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ev-key" className="text-xs">Stream key (vacío = autogenerar)</Label>
                <Input id="ev-key" value={streamKey} onChange={(e) => setStreamKey(e.target.value)} className="font-mono text-xs" placeholder="autogenerado" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ev-hls" className="text-xs">URL HLS pública (.m3u8)</Label>
                <Input id="ev-hls" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} className="font-mono text-xs" placeholder="https://stream.mux.com/camara1.m3u8" />
              </div>
            </div>
          </div>

          {/* Cámara 2 */}
          <div className="rounded-md border border-stone-300 bg-stone-50 p-3">
            <p className="mb-2 text-sm font-semibold text-stone-700">📹 Cámara 2 (opcional)</p>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="ev-rtmp2" className="text-xs">Servidor RTMP</Label>
                <Input id="ev-rtmp2" value={rtmpUrl2} onChange={(e) => setRtmpUrl2(e.target.value)} className="font-mono text-xs" placeholder="rtmp://tu-servidor.com/live" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ev-key2" className="text-xs">Stream key</Label>
                <Input id="ev-key2" value={streamKey2} onChange={(e) => setStreamKey2(e.target.value)} className="font-mono text-xs" placeholder="autogenerado" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ev-hls2" className="text-xs">URL HLS pública (.m3u8)</Label>
                <Input id="ev-hls2" value={streamUrl2} onChange={(e) => setStreamUrl2(e.target.value)} className="font-mono text-xs" placeholder="https://stream.mux.com/camara2.m3u8" />
              </div>
            </div>
          </div>

          {/* Cámara 3 */}
          <div className="rounded-md border border-stone-300 bg-stone-50 p-3">
            <p className="mb-2 text-sm font-semibold text-stone-700">📹 Cámara 3 (opcional)</p>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="ev-rtmp3" className="text-xs">Servidor RTMP</Label>
                <Input id="ev-rtmp3" value={rtmpUrl3} onChange={(e) => setRtmpUrl3(e.target.value)} className="font-mono text-xs" placeholder="rtmp://tu-servidor.com/live" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ev-key3" className="text-xs">Stream key</Label>
                <Input id="ev-key3" value={streamKey3} onChange={(e) => setStreamKey3(e.target.value)} className="font-mono text-xs" placeholder="autogenerado" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ev-hls3" className="text-xs">URL HLS pública (.m3u8)</Label>
                <Input id="ev-hls3" value={streamUrl3} onChange={(e) => setStreamUrl3(e.target.value)} className="font-mono text-xs" placeholder="https://stream.mux.com/camara3.m3u8" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-1 h-4 w-4" /> Cancelar
          </Button>
          <Button className="bg-red-700 hover:bg-red-800" onClick={save} disabled={saving}>
            <Save className="mr-1 h-4 w-4" /> {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
