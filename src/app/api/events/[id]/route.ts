import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, requireAdmin } from '@/lib/session'

/**
 * GET /api/events/[id]
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await getCurrentUser(req)
  const event = await db.event.findUnique({ where: { id } })
  if (!event) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

  const isOwner = user?.role === 'ADMIN'
  const purchased = user
    ? !!(await db.purchase.findUnique({
        where: { userId_eventId: { userId: user.id, eventId: event.id } },
      }))
    : false

  return NextResponse.json({
    event: {
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate.toISOString(),
      price: event.price,
      currency: event.currency,
      coverColor: event.coverColor,
      status: event.status,
      purchased,
      // Cámara 1
      streamUrl: purchased || isOwner ? event.streamUrl : null,
      rtmpUrl: isOwner ? event.rtmpUrl : null,
      streamKey: isOwner ? event.streamKey : null,
      // Cámara 2
      streamUrl2: purchased || isOwner ? event.streamUrl2 : null,
      rtmpUrl2: isOwner ? event.rtmpUrl2 : null,
      streamKey2: isOwner ? event.streamKey2 : null,
      // Cámara 3
      streamUrl3: purchased || isOwner ? event.streamUrl3 : null,
      rtmpUrl3: isOwner ? event.rtmpUrl3 : null,
      streamKey3: isOwner ? event.streamKey3 : null,
    },
  })
}

/**
 * PUT /api/events/[id]  (ADMIN only)
 */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req)
  } catch (e: any) {
    return NextResponse.json({ error: 'No autorizado' }, { status: e.status ?? 401 })
  }
  const { id } = await ctx.params
  const body = await req.json().catch(() => ({} as any))
  const {
    title, description, eventDate, price,
    streamUrl, streamUrl2, streamUrl3,
    rtmpUrl, rtmpUrl2, rtmpUrl3,
    streamKey, streamKey2, streamKey3,
    coverColor, status,
  } = body as any

  const existing = await db.event.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

  const data: any = {}
  if (title !== undefined) data.title = String(title).trim()
  if (description !== undefined) data.description = String(description).trim()
  if (eventDate !== undefined) {
    const d = new Date(eventDate)
    if (!isNaN(d.getTime())) data.eventDate = d
  }
  if (price !== undefined) data.price = Number(price)
  if (streamUrl !== undefined) data.streamUrl = String(streamUrl).trim()
  if (streamUrl2 !== undefined) data.streamUrl2 = String(streamUrl2).trim()
  if (streamUrl3 !== undefined) data.streamUrl3 = String(streamUrl3).trim()
  if (rtmpUrl !== undefined) data.rtmpUrl = String(rtmpUrl).trim()
  if (rtmpUrl2 !== undefined) data.rtmpUrl2 = String(rtmpUrl2).trim()
  if (rtmpUrl3 !== undefined) data.rtmpUrl3 = String(rtmpUrl3).trim()
  if (streamKey !== undefined) data.streamKey = String(streamKey).trim()
  if (streamKey2 !== undefined) data.streamKey2 = String(streamKey2).trim()
  if (streamKey3 !== undefined) data.streamKey3 = String(streamKey3).trim()
  if (coverColor !== undefined) data.coverColor = String(coverColor).trim()
  if (status !== undefined && ['UPCOMING', 'LIVE', 'ENDED', 'CANCELLED'].includes(status)) {
    data.status = status
  }

  const updated = await db.event.update({ where: { id }, data })
  return NextResponse.json({ event: updated })
}

/**
 * DELETE /api/events/[id]  (ADMIN only)
 */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req)
  } catch (e: any) {
    return NextResponse.json({ error: 'No autorizado' }, { status: e.status ?? 401 })
  }
  const { id } = await ctx.params
  await db.event.delete({ where: { id } }).catch(() => null)
  return NextResponse.json({ ok: true })
}
