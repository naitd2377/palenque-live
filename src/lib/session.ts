import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSession, SESSION_COOKIE } from '@/lib/auth'

export type CurrentUser = {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
}

/**
 * Read session cookie and return the matching user (or null).
 */
export async function getCurrentUser(req: NextRequest): Promise<CurrentUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const session = getSession(token)
  if (!session) return null
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true, phone: true },
  })
  return user
}

/**
 * Same as getCurrentUser but throws 401 if not authenticated.
 */
export async function requireUser(req: NextRequest): Promise<CurrentUser> {
  const user = await getCurrentUser(req)
  if (!user) throw new UnauthorizedError()
  return user
}

/**
 * Throw 401 if not admin.
 */
export async function requireAdmin(req: NextRequest): Promise<CurrentUser> {
  const user = await requireUser(req)
  if (user.role !== 'ADMIN') throw new ForbiddenError()
  return user
}

export class UnauthorizedError extends Error {
  status = 401
}
export class ForbiddenError extends Error {
  status = 403
}
