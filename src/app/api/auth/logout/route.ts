import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // Stateless token — no server-side cleanup needed. Just clear the cookie.
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SESSION_COOKIE)
  return res
}
