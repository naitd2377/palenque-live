'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Save, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import { toast } from 'sonner'

type OverlayData = {
  overlayEnabled: boolean
  roundLabel: string | null
  teamRedName: string | null
  teamRedScore: number
  teamGreenName: string | null
  teamGreenScore: number
}

export default function ControlPage({ params }: { params: { eventId: string } }) {
  const { eventId } = params
  const [data, setData] = useState<OverlayData>({
    overlayEnabled: false,
    roundLabel: '',
    teamRedName: '',
    teamRedScore: 0,
    teamGreenName: '',
    teamGreenScore: 0,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/overlay/${eventId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setData(d.overlay || data))
  }, [eventId])

  async function autoSave(newData: OverlayData) {
    setData(newData)
    try {
      await fetch(`/api/overlay/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      })
      toast.success('Actualizado en vivo')
    } catch {
      toast.error('Error al actualizar')
    }
  }

  function quickUpdate(field: string, value: any) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  async function saveField() {
    await autoSave(data)
  }

  return (
    <div className="min-h-screen bg-stone-900 text-white p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-sm text-stone-400 hover:text-white flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <h1 className="text-3xl font-bold">Control de Overlays</h1>
          <p className="text-stone-400 text-sm">Edita los valores y se actualizan en vivo automáticamente</p>
        </div>

        {/* Activar/Desactivar */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-stone-700 bg-stone-800 p-4">
          <div className="flex items-center gap-3">
            {data.overlayEnabled ? <Eye className="h-5 w-5 text-green-500" /> : <EyeOff className="h-5 w-5 text-stone-500" />}
            <div>
              <p className="font-semibold">Overlay visible</p>
              <p className="text-xs text-stone-400">Activa o desactiva el overlay en la transmisión</p>
            </div>
          </div>
          <Switch
            checked={data.overlayEnabled}
            onCheckedChange={(v) => autoSave({ ...data, overlayEnabled: v })}
          />
        </div>

        {/* Ronda / Pelea */}
        <div className="mb-6 rounded-lg border border-stone-700 bg-stone-800 p-4">
          <Label className="text-sm font-semibold">Ronda / Pelea</Label>
          <Input
            value={data.roundLabel || ''}
            onChange={(e) => quickUpdate('roundLabel', e.target.value)}
            onBlur={saveField}
            placeholder="Ej: RONDA 1 / PELEA 1"
            className="mt-2 text-lg font-bold bg-stone-700 border-stone-600 text-white"
          />
        </div>

        {/* Marcador */}
        <div className="grid grid-cols-2 gap-4">
          {/* Partido Rojo */}
          <div className="rounded-lg border-2 border-red-600 bg-stone-800 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-600" />
              <span className="font-bold text-red-500">PARTIDO ROJO</span>
            </div>
            <Label className="text-xs">Nombre</Label>
            <Input
              value={data.teamRedName || ''}
              onChange={(e) => quickUpdate('teamRedName', e.target.value)}
              onBlur={saveField}
              placeholder="Ej: PEDRO"
              className="mb-3 bg-stone-700 border-stone-600 text-white"
            />
            <Label className="text-xs">Score</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-stone-700 border-stone-600 text-white hover:bg-stone-600"
                onClick={() => autoSave({ ...data, teamRedScore: Math.max(0, data.teamRedScore - 1) })}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={data.teamRedScore}
                onChange={(e) => quickUpdate('teamRedScore', Number(e.target.value))}
                onBlur={saveField}
                className="text-center text-2xl font-bold bg-stone-700 border-stone-600 text-white"
              />
              <Button
                size="sm"
                variant="outline"
                className="bg-stone-700 border-stone-600 text-white hover:bg-stone-600"
                onClick={() => autoSave({ ...data, teamRedScore: data.teamRedScore + 1 })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Partido Verde */}
          <div className="rounded-lg border-2 border-green-600 bg-stone-800 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-600" />
              <span className="font-bold text-green-500">PARTIDO VERDE</span>
            </div>
            <Label className="text-xs">Nombre</Label>
            <Input
              value={data.teamGreenName || ''}
              onChange={(e) => quickUpdate('teamGreenName', e.target.value)}
              onBlur={saveField}
              placeholder="Ej: SAUL"
              className="mb-3 bg-stone-700 border-stone-600 text-white"
            />
            <Label className="text-xs">Score</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-stone-700 border-stone-600 text-white hover:bg-stone-600"
                onClick={() => autoSave({ ...data, teamGreenScore: Math.max(0, data.teamGreenScore - 1) })}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={data.teamGreenScore}
                onChange={(e) => quickUpdate('teamGreenScore', Number(e.target.value))}
                onBlur={saveField}
                className="text-center text-2xl font-bold bg-stone-700 border-stone-600 text-white"
              />
              <Button
                size="sm"
                variant="outline"
                className="bg-stone-700 border-stone-600 text-white hover:bg-stone-600"
                onClick={() => autoSave({ ...data, teamGreenScore: data.teamGreenScore + 1 })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Link al overlay */}
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-stone-900">
          <h3 className="mb-2 font-bold">💡 Cómo usar</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Activa el switch "Overlay visible" para mostrarlo</li>
            <li>Edita nombres y scores (se actualizan solos en vivo)</li>
            <li>Usa los botones + y − para cambiar el score rápidamente</li>
            <li>Para ver el overlay: abre <a href={`/overlay/${eventId}`} target="_blank" className="text-red-700 underline">esta página</a> en otra pestaña</li>
            <li>Tus clientes lo verán automáticamente sobre el video</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
