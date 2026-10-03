import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'

/**
 * POST /api/webhook
 *
 * Recibe webhooks de Stripe. Cuando un pago se completa,
 * crea el registro de Purchase en la BD.
 *
 * IMPORTANTE: Esta ruta NO usa requireUser porque Stripe la llama directamente.
 * Verifica la firma del webhook con STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 })
  }

  // Manejar eventos
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const userId = session.metadata?.userId
      const eventId = session.metadata?.eventId

      if (userId && eventId) {
        // Buscar el evento para obtener el precio
        const ev = await db.event.findUnique({ where: { id: eventId } })
        if (ev) {
          // Crear el Purchase si no existe
          const existing = await db.purchase.findUnique({
            where: { userId_eventId: { userId, eventId } },
          })
          if (!existing) {
            await db.purchase.create({
              data: {
                userId,
                eventId,
                amount: ev.price,
                currency: ev.currency,
                status: 'PAID',
              },
            })
            console.log(`✓ Compra registrada: usuario ${userId} evento ${eventId}`)
          }
        }
      }
      break
    }
    default:
      // Ignorar otros eventos
      break
  }

  return NextResponse.json({ received: true })
}
