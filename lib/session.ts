import { cookies } from "next/headers"

// Single-admin auth: one shared password, no user accounts. A session is
// just a timestamp signed with ADMIN_SESSION_SECRET so it can be verified
// without a database round-trip (works in middleware's edge runtime too).

export const SESSION_COOKIE_NAME = "motofind_admin_session"
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

async function getSessionSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set")
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
}

async function signValue(value: string): Promise<string> {
  const key = await getSessionSecretKey()
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))
  return toHex(signature)
}

async function buildSessionToken(): Promise<string> {
  const issuedAt = Date.now().toString()
  const signature = await signValue(issuedAt)
  return `${issuedAt}.${signature}`
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const [issuedAt, signature] = token.split(".")
  if (!issuedAt || !signature) return false

  const age = Date.now() - Number(issuedAt)
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) return false

  const expected = await signValue(issuedAt)
  return timingSafeEqualString(expected, signature)
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) throw new Error("ADMIN_PASSWORD is not set")
  return timingSafeEqualString(password, expected)
}

export async function createSessionCookie() {
  const token = await buildSessionToken()
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_MS / 1000,
  })
}

export async function destroySessionCookie() {
  const store = await cookies()
  store.delete(SESSION_COOKIE_NAME)
}

export async function hasValidSession(): Promise<boolean> {
  const store = await cookies()
  return isValidSessionToken(store.get(SESSION_COOKIE_NAME)?.value)
}
