"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import type { Listing } from "@/lib/db/schema"
import { updateListingStatus, type ListingStats } from "@/app/actions/listings"
import type { ListingStatus } from "@/lib/listing-status"
import { Button } from "@/components/ui/button"
import { Check, Star, X, ExternalLink, MapPin, Calendar, Gauge } from "lucide-react"

const TABS: { value: ListingStatus; label: string }[] = [
  { value: "pending", label: "Review Queue" },
  { value: "approved", label: "Approved" },
  { value: "saved", label: "Saved" },
  { value: "skipped", label: "Skipped" },
]

function firstImage(imageUrls: string | null): string | null {
  if (!imageUrls) return null
  try {
    const parsed = JSON.parse(imageUrls)
    return Array.isArray(parsed) && typeof parsed[0] === "string" ? parsed[0] : null
  } catch {
    return null
  }
}

function scoreColor(score: number | null) {
  if (score === null) return "bg-muted text-muted-foreground"
  if (score >= 9) return "bg-primary text-primary-foreground"
  if (score >= 7) return "bg-amber-500/90 text-black"
  return "bg-muted text-muted-foreground"
}

export function CurationManager({
  listings,
  stats,
  currentStatus,
}: {
  listings: Listing[]
  stats: ListingStats
  currentStatus: ListingStatus
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleAction(id: number, status: ListingStatus) {
    startTransition(async () => {
      try {
        await updateListingStatus(id, status)
        router.refresh()
      } catch {
        toast.error("Could not update listing.")
      }
    })
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-foreground">
            Scraper Curation
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-flagged listings pulled from Craigslist, eBay, Cycle Trader &amp; Facebook.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <div>
            Today <strong className="text-foreground">{stats.today}</strong>
          </div>
          <div>
            Pending <strong className="text-foreground">{stats.pendingReview}</strong>
          </div>
          <div>
            Approved <strong className="text-foreground">{stats.approved}</strong>
          </div>
          <div>
            Total <strong className="text-foreground">{stats.total}</strong>
          </div>
        </div>
      </div>

      <div className="mb-8 flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/curation?status=${tab.value}`}
            className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
              currentStatus === tab.value
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-20 text-center">
          <p className="font-serif text-xl text-foreground">Nothing here yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {currentStatus === "pending"
              ? "Run the scraper pipeline to pull in new listings."
              : `No ${currentStatus} listings yet.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const image = firstImage(listing.imageUrls)
            const subtitle = [listing.year, listing.make, listing.model]
              .filter(Boolean)
              .join(" ")

            return (
              <div
                key={listing.id}
                className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image || "/placeholder.svg"}
                    alt={listing.title ?? "Listing"}
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${scoreColor(listing.aiScore)}`}
                  >
                    {listing.aiScore ?? "—"}/10
                  </span>
                  {listing.aiCategory && (
                    <span className="absolute right-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
                      {listing.aiCategory}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-base leading-tight text-card-foreground hover:text-primary"
                  >
                    {listing.title || "No title"}
                  </a>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-primary">
                      {listing.price ? `$${listing.price.toLocaleString()}` : "Price TBD"}
                    </span>
                    {listing.location && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {listing.location}
                      </span>
                    )}
                  </div>

                  {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}

                  {listing.aiReason && (
                    <p className="rounded-md border-l-2 border-primary bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                      {listing.aiReason}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    {listing.year && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {listing.year}
                      </span>
                    )}
                    {listing.mileage && (
                      <span className="inline-flex items-center gap-1">
                        <Gauge className="size-3" />
                        {listing.mileage.toLocaleString()}mi
                      </span>
                    )}
                    <span className="capitalize">{listing.platform}</span>
                  </div>

                  <div className="mt-auto pt-2">
                    {currentStatus === "pending" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleAction(listing.id, "approved")}
                          className="flex-1 border-green-600/40 text-green-600 hover:bg-green-600/10 hover:text-green-600"
                        >
                          <Check className="size-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleAction(listing.id, "saved")}
                          className="flex-1 border-blue-500/40 text-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
                        >
                          <Star className="size-4" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleAction(listing.id, "skipped")}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <a
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-md border border-border py-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="size-3.5" />
                        View original
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
