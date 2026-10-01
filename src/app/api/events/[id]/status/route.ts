import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/session'

/**
 * PATCH /api/events/[id]/status
 *   Body: { status: 'UPCOMING'|'LIVE'|'ENDED'|'CANCELLED' }
 *   Admin only — quick status toggle from the dashboard.
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req)
  } catch (e: any) {
    return NextResponse.json({ error: 'No autorizado' }, { status: e.status ?? 401 })
  }
  const { id } = await ctx.params
  const body = await req.json().catch(() => ({} as any))
  const { status } = body as { status?: string }

  if (!status || !['UPCOMING', 'LIVE', 'ENDED', 'CANCELLED'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const updated = await db.event.update({ where: { id }, data: { status } })
  return NextResponse.json({ event: updated })
}
