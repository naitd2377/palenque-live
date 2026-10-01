import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'

/**
 * POST /api/events/[id]/purchase
 *   Body: { paymentMethod?: 'OXXO'|'CARD'|'TRANSFER' }
 *   Creates a Purchase record for the current user on this event.
 *   This is a SIMULATED payment — replace with Stripe / MercadoPago for real charges.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  let user
  try {
    user = await requireUser(req)
  } catch (e: any) {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
  }

  const { id } = await ctx.params
  const event = await db.event.findUnique({ where: { id } })
  if (!event) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
  if (event.status === 'CANCELLED' || event.status === 'ENDED') {
    return NextResponse.json({ error: 'Este evento ya no está disponible' }, { status: 400 })
  }

  const existing = await db.purchase.findUnique({
    where: { userId_eventId: { userId: user.id, eventId: event.id } },
  })
  if (existing) {
    return NextResponse.json({ purchase: existing, alreadyPurchased: true })
  }

  const purchase = await db.purchase.create({
    data: {
      userId: user.id,
      eventId: event.id,
      amount: event.price,
      currency: event.currency,
      status: 'PAID',
    },
  })

  return NextResponse.json({ purchase, alreadyPurchased: false }, { status: 201 })
}
