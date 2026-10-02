import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth'

export type CurrentUser = {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
}

/**
 * Read session cookie, verify the token, and look up the user in the DB.
 *
 * IMPORTANT: We do NOT trust any role/identity stored in the token —
 * we always fetch the current state from the DB so that changes
 * (e.g. promoting a user to ADMIN via SQL) take effect immediately.
 *
 * This is stateless and works correctly on Vercel serverless.
 */
export async function getCurrentUser(req: NextRequest): Promise<CurrentUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const sessionData = verifySessionToken(token)
  if (!sessionData) return null
  const user = await db.user.findUnique({
    where: { id: sessionData.userId },
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
