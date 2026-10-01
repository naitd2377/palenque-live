import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

/**
 * GET /api/admin/stats  — dashboard summary numbers
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
  } catch (e: any) {
    return NextResponse.json({ error: 'No autorizado' }, { status: e.status ?? 401 })
  }

  const [totalUsers, totalClients, totalEvents, liveEvents, upcomingEvents, allPurchases] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: 'CLIENT' } }),
    db.event.count(),
    db.event.count({ where: { status: 'LIVE' } }),
    db.event.count({ where: { status: 'UPCOMING' } }),
    db.purchase.findMany({ select: { amount: true, status: true, createdAt: true } }),
  ])

  const revenue = allPurchases
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0)

  // Sales in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const salesLast7Days = allPurchases.filter(
    (p) => p.status === 'PAID' && p.createdAt >= sevenDaysAgo,
  ).length

  return NextResponse.json({
    stats: {
      totalUsers,
      totalClients,
      totalEvents,
      liveEvents,
      upcomingEvents,
      totalPurchases: allPurchases.length,
      salesLast7Days,
      revenue,
    },
  })
}
