import { getCuratedListings, getListingStats } from "@/app/actions/listings"
import { LISTING_STATUSES, type ListingStatus } from "@/lib/listing-status"
import { CurationManager } from "@/components/curation-manager"

export default async function CurationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: rawStatus } = await searchParams
  const status = (LISTING_STATUSES as readonly string[]).includes(rawStatus ?? "")
    ? (rawStatus as ListingStatus)
    : "pending"

  const [listings, stats] = await Promise.all([
    getCuratedListings(status),
    getListingStats(),
  ])

  return <CurationManager listings={listings} stats={stats} currentStatus={status} />
}
