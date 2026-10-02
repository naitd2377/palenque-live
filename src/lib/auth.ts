import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto'

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
 * Session cookie name.
 */
export const SESSION_COOKIE = 'palenque_session'

/**
 * JWT-like session token (stateless).
 *
 * Format: "payload.signature"
 * - payload = base64url(JSON { uid, iat })
 * - signature = HMAC-SHA256(payload, SESSION_SECRET)
 *
 * Stateless = works on Vercel serverless where in-memory state is lost
 * between invocations. We do NOT store role in the token — instead, we
 * look it up in the DB on every request so role changes take effect
 * immediately on next request.
 */
const SESSION_SECRET = process.env.SESSION_SECRET || 'palenque-live-dev-secret-change-me'

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64urlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(padded, 'base64')
}

function sign(payload: string): string {
  return createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
}

export function createSessionToken(userId: string): string {
  const payload = base64url(JSON.stringify({ uid: userId, iat: Date.now() }))
  const signature = sign(payload)
  return `${payload}.${signature}`
}

export function verifySessionToken(token: string | undefined | null): { userId: string } | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, signature] = parts
  const expectedSig = sign(payload)
  if (signature.length !== expectedSig.length) return null
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null
  } catch {
    return null
  }
  try {
    const decoded = JSON.parse(base64urlDecode(payload).toString())
    if (!decoded.uid) return null
    return { userId: decoded.uid }
  } catch {
    return null
  }
}
