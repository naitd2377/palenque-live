import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'

/**
 * GET /api/purchases  — list the current user's purchases (CLIENT) or all (ADMIN)
 */
export async function GET(req: NextRequest) {
  let user
  try {
    user = await requireUser(req)
  } catch (e: any) {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
  }

  const where = user.role === 'ADMIN' ? {} : { userId: user.id }
  const purchases = await db.purchase.findMany({
    where,
    include: { event: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    purchases: purchases.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      event: {
        id: p.event.id,
        title: p.event.title,
        eventDate: p.event.eventDate.toISOString(),
        status: p.event.status,
        coverColor: p.event.coverColor,
      },
      user: p.user,
    })),
  })
}
