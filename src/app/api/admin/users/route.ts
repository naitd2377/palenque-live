import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

/**
 * GET /api/admin/users  — list all users with purchase count and total spent
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
  } catch (e: any) {
    return NextResponse.json({ error: 'No autorizado' }, { status: e.status ?? 401 })
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      purchases: { select: { id: true, amount: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const result = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    purchaseCount: u.purchases.length,
    totalSpent: u.purchases.reduce((sum, p) => sum + p.amount, 0),
  }))

  return NextResponse.json({ users: result })
}
