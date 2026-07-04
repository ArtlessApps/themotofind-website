import { redirect } from "next/navigation"
import { hasValidSession } from "@/lib/session"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  if (await hasValidSession()) redirect("/admin")
  const { next } = await searchParams
  return <LoginForm next={next ?? "/admin"} />
}
