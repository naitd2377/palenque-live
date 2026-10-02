import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any))
  const { email, password } = body as { email?: string; password?: string }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const user = await db.user.findUnique({ where: { email: normalizedEmail } })

  if (!user || !verifyPassword(password, user.password)) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  // Stateless JWT-like token: only stores userId. Role is read from DB on each request.
  const token = createSessionToken(user.id)

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone },
  })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
