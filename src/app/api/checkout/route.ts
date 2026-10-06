import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stripe, APP_URL } from '@/lib/stripe'
import { requireUser } from '@/lib/session'

/**
 * POST /api/checkout
 * Body: { eventId: string }
 *
 * Crea una sesión de Stripe Checkout para que el cliente pague el acceso al evento.
 * Redirige al cliente a la página de pago de Stripe.
 */
export async function POST(req: NextRequest) {
  let user
  try {
    user = await requireUser(req)
  } catch {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({} as any))
  const { eventId } = body as { eventId?: string }

  if (!eventId) {
    return NextResponse.json({ error: 'eventId es obligatorio' }, { status: 400 })
  }

  const event = await db.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
  }
  if (event.status === 'CANCELLED' || event.status === 'ENDED') {
    return NextResponse.json({ error: 'Evento no disponible' }, { status: 400 })
  }

  // Verificar si ya comprió
  const existing = await db.purchase.findUnique({
    where: { userId_eventId: { userId: user.id, eventId: event.id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Ya tienes acceso a este evento', alreadyPurchased: true }, { status: 400 })
  }

  try {
    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: event.title,
              description: event.description.slice(0, 100),
            },
            unit_amount: Math.round(event.price * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        eventId: event.id,
      },
      success_url: `${APP_URL}/?checkout=success&event=${event.id}`,
      cancel_url: `${APP_URL}/?checkout=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating Stripe session:', error)
    return NextResponse.json(
      { error: 'Error al crear la sesión de pago: ' + error.message },
      { status: 500 },
    )
  }
}
