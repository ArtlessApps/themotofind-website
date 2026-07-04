"use server"

import { redirect } from "next/navigation"
import { createSessionCookie, destroySessionCookie, verifyPassword } from "@/lib/session"

export type LoginState = { error: string | null }

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "/admin")

  if (!verifyPassword(password)) {
    return { error: "Incorrect password" }
  }

  await createSessionCookie()
  redirect(next.startsWith("/") ? next : "/admin")
}

export async function logout() {
  await destroySessionCookie()
  redirect("/login")
}
