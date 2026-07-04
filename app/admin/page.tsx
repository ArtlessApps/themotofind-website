import { getMyMotorcycles } from "@/app/actions/motorcycles"
import { AdminManager } from "@/components/admin-manager"

export default async function AdminPage() {
  const bikes = await getMyMotorcycles()
  return <AdminManager initialBikes={bikes} />
}
