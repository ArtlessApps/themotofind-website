import { cookies } from "next/headers"

// Marks a visitor as having subscribed so the soft gate can unlock the full
// gallery for them. This is a UX convenience, not an access-control
// boundary — the gallery data itself remains public.
export const SUBSCRIBER_COOKIE_NAME = "motofind_subscriber"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365 // 1 year

export async function setSubscriberCookie() {
  const store = await cookies()
  store.set(SUBSCRIBER_COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function isSubscribed(): Promise<boolean> {
  const store = await cookies()
  return store.get(SUBSCRIBER_COOKIE_NAME)?.value === "1"
}
