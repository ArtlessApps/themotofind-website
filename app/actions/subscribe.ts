"use server"

import { redirect } from "next/navigation"
import { subscribeToBeehiiv } from "@/lib/beehiiv"
import { setSubscriberCookie } from "@/lib/subscriber"

export type SubscribeState = { error: string | null }

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function subscribe(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim()
  const source = String(formData.get("source") ?? "website")
  const next = String(formData.get("next") ?? "/")

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." }
  }

  try {
    await subscribeToBeehiiv(email, source)
  } catch (error) {
    console.error("Beehiiv subscribe failed:", error)
    return { error: "Something went wrong. Please try again." }
  }

  await setSubscriberCookie()
  redirect(next.startsWith("/") ? next : "/")
}
