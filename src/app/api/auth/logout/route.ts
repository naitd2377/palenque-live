import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, clearSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  clearSession(token)
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SESSION_COOKIE)
  return res
}
