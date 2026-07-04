import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getMyMotorcycles } from "@/app/actions/motorcycles"
import { AdminManager } from "@/components/admin-manager"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const bikes = await getMyMotorcycles()

  return <AdminManager initialBikes={bikes} userName={session.user.name} />
}
