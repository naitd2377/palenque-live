import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pusher, chatChannel, NEW_MESSAGE_EVENT } from '@/lib/pusher'
import { requireUser } from '@/lib/session'

/**
 * GET /api/chat/[eventId]
 * Obtiene los últimos 50 mensajes del chat de un evento.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  let user
  try {
    user = await requireUser(req)
  } catch {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
  }

  const { eventId } = await ctx.params
  const event = await db.event.findUnique({ where: { id: eventId } })
  if (!event) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

  const messages = await db.message.findMany({
    where: { eventId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 50, // últimos 50 mensajes
  })

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      text: m.text,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
      isMine: m.userId === user.id,
    })),
  })
}

/**
 * POST /api/chat/[eventId]
 * Body: { text: string }
 * Crea un nuevo mensaje y lo emite por Pusher.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  let user
  try {
    user = await requireUser(req)
  } catch {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
  }

  const { eventId } = await ctx.params
  const body = await req.json().catch(() => ({} as any))
  const { text } = body as { text?: string }

  if (!text || !text.trim()) {
    return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 })
  }
  if (text.length > 500) {
    return NextResponse.json({ error: 'Mensaje demasiado largo (máx 500 caracteres)' }, { status: 400 })
  }

  const event = await db.event.findUnique({ where: { id: eventId } })
  if (!event) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

  // Crear el mensaje en la BD
  const message = await db.message.create({
    data: {
      eventId,
      userId: user.id,
      text: text.trim(),
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  })

  // Emitir por Pusher a todos los clientes conectados al canal
  await pusher.trigger(chatChannel(eventId), NEW_MESSAGE_EVENT, {
    id: message.id,
    text: message.text,
    createdAt: message.createdAt.toISOString(),
    user: message.user,
  })

  return NextResponse.json({
    message: {
      id: message.id,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
      user: message.user,
      isMine: true,
    },
  })
}
