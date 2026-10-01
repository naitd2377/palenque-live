import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

/**
 * Hash a password using scrypt (Node built-in, no extra deps).
 * Returns "salt:hash" format.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verify a password against a stored "salt:hash".
 */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const testHashBuf = scryptSync(password, salt, 64)
  const storedBuf = Buffer.from(hash, 'hex')
  if (testHashBuf.length !== storedBuf.length) return false
  return timingSafeEqual(testHashBuf, storedBuf)
}

/**
 * Create a simple session token (random hex).
 * In production you'd use JWT with a secret, but this works for our private platform.
 */
export function createSessionToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Session cookie name.
 */
export const SESSION_COOKIE = 'palenque_session'

/**
 * Simple in-memory session store.
 * token -> { userId, role, createdAt }
 * (Resets on server restart — fine for a small private platform.
 *  For production with persistence, swap with a DB-backed sessions table.)
 */
const sessions = new Map<string, { userId: string; role: string; createdAt: number }>()

export function setSession(token: string, data: { userId: string; role: string }) {
  sessions.set(token, { ...data, createdAt: Date.now() })
}

export function getSession(token: string | undefined | null) {
  if (!token) return null
  return sessions.get(token) ?? null
}

export function clearSession(token: string | undefined | null) {
  if (!token) return
  sessions.delete(token)
}
