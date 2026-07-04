import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { hasValidSession } from "@/lib/session"
import { AdminNav } from "@/components/admin-nav"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await hasValidSession())) redirect("/login")

  return (
    <div className="min-h-svh bg-background">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  )
}
