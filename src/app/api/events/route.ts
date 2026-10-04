import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, requireAdmin } from '@/lib/session'

/**
 * GET /api/events
 *   Public: returns all events with purchase info for the current user.
 *   Query: ?status=LIVE|UPCOMING|ENDED  (optional filter)
 */
export async function GET(req: NextRequest) {
  const statusFilter = req.nextUrl.searchParams.get('status')
  const user = await getCurrentUser(req)

  const where = statusFilter ? { status: statusFilter } : {}
  const events = await db.event.findMany({
    where,
    orderBy: [{ status: 'asc' }, { eventDate: 'asc' }],
  })

  // For signed-in users, include their purchases
  let purchases: { eventId: string }[] = []
  if (user) {
    purchases = await db.purchase.findMany({
      where: { userId: user.id, status: 'PAID' },
      select: { eventId: true },
    })
  }
  const purchasedSet = new Set(purchases.map((p) => p.eventId))

  // Hide streamUrl for non-purchased events
  const result = events.map((e) => {
    const purchased = purchasedSet.has(e.id)
    const isOwner = user?.role === 'ADMIN'
        return {
      id: e.id,
      title: e.title,
      description: e.description,
      eventDate: e.eventDate.toISOString(),
      price: e.price,
      currency: e.currency,
      coverColor: e.coverColor,
      status: e.status,
      purchased,
      // Cámara 1
      streamUrl: purchased || isOwner ? e.streamUrl : null,
      rtmpUrl: isOwner ? e.rtmpUrl : null,
      streamKey: isOwner ? e.streamKey : null,
      // Cámara 2
      streamUrl2: purchased || isOwner ? e.streamUrl2 : null,
      rtmpUrl2: isOwner ? e.rtmpUrl2 : null,
      streamKey2: isOwner ? e.streamKey2 : null,
      // Cámara 3
      streamUrl3: purchased || isOwner ? e.streamUrl3 : null,
      rtmpUrl3: isOwner ? e.rtmpUrl3 : null,
      streamKey3: isOwner ? e.streamKey3 : null,
    }
  })

  return NextResponse.json({ events: result })
}

/**
 * POST /api/events  (ADMIN only)
 *   Body: { title, description, eventDate, price, streamUrl?, rtmpUrl?, streamKey?, coverColor? }
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
  } catch (e: any) {
    return NextResponse.json({ error: 'No autorizado' }, { status: e.status ?? 401 })
  }

  const body = await req.json().catch(() => ({} as any))
  const { title, description, eventDate, price, streamUrl, streamUrl2, streamUrl3, rtmpUrl, rtmpUrl2, rtmpUrl3, streamKey, streamKey2, streamKey3, coverColor, status } = body as any {
      if (streamUrl !== undefined) data.streamUrl = String(streamUrl).trim()
  if (streamUrl2 !== undefined) data.streamUrl2 = String(streamUrl2).trim()
  if (streamUrl3 !== undefined) data.streamUrl3 = String(streamUrl3).trim()
  if (rtmpUrl !== undefined) data.rtmpUrl = String(rtmpUrl).trim()
  if (rtmpUrl2 !== undefined) data.rtmpUrl2 = String(rtmpUrl2).trim()
  if (rtmpUrl3 !== undefined) data.rtmpUrl3 = String(rtmpUrl3).trim()
  if (streamKey !== undefined) data.streamKey = String(streamKey).trim()
  if (streamKey2 !== undefined) data.streamKey2 = String(streamKey2).trim()
  if (streamKey3 !== undefined) data.streamKey3 = String(streamKey3).trim()
    title?: string
    description?: string
    eventDate?: string
    price?: number
    streamUrl?: string
    rtmpUrl?: string
    streamKey?: string
    coverColor?: string
  }

  if (!title || !description || !eventDate || price == null) {
    return NextResponse.json(
      { error: 'Faltan campos obligatorios: title, description, eventDate, price' },
      { status: 400 },
    )
  }

  const date = new Date(eventDate)
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 })
  }

  const event = await db.event.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      eventDate: date,
      price: Number(price),
      currency: 'MXN',
      streamUrl: streamUrl?.trim() || '',
      rtmpUrl: rtmpUrl?.trim() || 'rtmp://localhost/live',
      streamKey: streamKey?.trim() || Math.random().toString(36).slice(2, 10),
      coverColor: coverColor || '#b91c1c',
      status: 'UPCOMING',
    },
  })

  return NextResponse.json({ event }, { status: 201 })
}
