import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pusher } from '@/lib/pusher'
import { requireAdmin } from '@/lib/session'

/**
 * GET /api/overlay/[eventId]
 * Devuelve el estado actual del overlay (público).
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await ctx.params
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      overlayEnabled: true,
      roundLabel: true,
      teamRedName: true,
      teamRedScore: true,
      teamGreenName: true,
      teamGreenScore: true,
    },
  })
  if (!event) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
  return NextResponse.json({ overlay: event })
}

/**
 * PUT /api/overlay/[eventId]  (ADMIN only)
 * Actualiza el overlay y emite el cambio por Pusher en tiempo real.
 */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  try {
    await requireAdmin(req)
  } catch (e: any) {
    return NextResponse.json({ error: 'No autorizado' }, { status: e.status ?? 401 })
  }
  const { eventId } = await ctx.params
  const body = await req.json().catch(() => ({} as any))
  const {
    overlayEnabled,
    roundLabel,
    teamRedName,
    teamRedScore,
    teamGreenName,
    teamGreenScore,
  } = body as any

  const data: any = {}
  if (overlayEnabled !== undefined) data.overlayEnabled = Boolean(overlayEnabled)
  if (roundLabel !== undefined) data.roundLabel = String(roundLabel).trim()
  if (teamRedName !== undefined) data.teamRedName = String(teamRedName).trim()
  if (teamRedScore !== undefined) data.teamRedScore = Number(teamRedScore) || 0
  if (teamGreenName !== undefined) data.teamGreenName = String(teamGreenName).trim()
  if (teamGreenScore !== undefined) data.teamGreenScore = Number(teamGreenScore) || 0

  const updated = await db.event.update({ where: { id: eventId }, data })

  // Emitir por Pusher para actualización en tiempo real
  await pusher.trigger(`overlay-${eventId}`, 'update', {
    overlayEnabled: updated.overlayEnabled,
    roundLabel: updated.roundLabel,
    teamRedName: updated.teamRedName,
    teamRedScore: updated.teamRedScore,
    teamGreenName: updated.teamGreenName,
    teamGreenScore: updated.teamGreenScore,
  })

  return NextResponse.json({ overlay: updated })
}
