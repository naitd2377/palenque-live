import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any))
  const { email, password, name, phone } = body as {
    email?: string
    password?: string
    name?: string
    phone?: string
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese correo' }, { status: 409 })
  }

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
  }

  const user = await db.user.create({
    data: {
      email: normalizedEmail,
      name: name.trim(),
      phone: phone?.trim() || null,
      password: hashPassword(password),
      role: 'CLIENT',
    },
    select: { id: true, email: true, name: true, role: true, phone: true },
  })

  const token = createSessionToken(user.id)

  const res = NextResponse.json({ user })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
