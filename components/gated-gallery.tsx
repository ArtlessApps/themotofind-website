import type { Motorcycle } from "@/lib/db/schema"
import { MotorcycleCard } from "@/components/motorcycle-card"
import { SubscribeForm } from "@/components/subscribe-form"

// Soft gate: show the first FREE_PREVIEW_COUNT bikes normally, then blur any
// remaining bikes behind an inline subscribe CTA. Content still exists in the
// DOM (good for SEO/sharing) but is visually locked until the visitor
// subscribes. An inline subscribe card is always woven into the grid too —
// this way there's a CTA even when inventory is small and there's nothing
// left over to lock.
const FREE_PREVIEW_COUNT = 6

function InlineSubscribeCard() {
  return (
    <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-primary/40 bg-card p-6 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">
        Free newsletter
      </p>
      <h3 className="font-serif text-lg tracking-tight text-card-foreground">
        Get new finds in your inbox
      </h3>
      <p className="text-sm text-muted-foreground">
        Hand-picked motorcycles, straight from the feed.
      </p>
      <SubscribeForm
        source="gallery-inline"
        next="/#gallery"
        buttonLabel="Subscribe"
        className="w-full flex-col sm:flex-col"
      />
    </div>
  )
}

export function GatedGallery({
  bikes,
  isSubscribed,
}: {
  bikes: Motorcycle[]
  isSubscribed: boolean
}) {
  if (isSubscribed) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bikes.map((bike) => (
          <MotorcycleCard key={bike.id} bike={bike} />
        ))}
      </div>
    )
  }

  const visible = bikes.slice(0, FREE_PREVIEW_COUNT)
  const locked = bikes.slice(FREE_PREVIEW_COUNT)

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((bike) => (
          <MotorcycleCard key={bike.id} bike={bike} />
        ))}
        <InlineSubscribeCard />
      </div>

      {locked.length > 0 && (
        <div className="relative mt-6">
          <div
            aria-hidden
            className="pointer-events-none grid select-none grid-cols-1 gap-6 opacity-60 blur-sm sm:grid-cols-2 lg:grid-cols-3"
          >
            {locked.map((bike) => (
              <MotorcycleCard key={bike.id} bike={bike} />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/95 to-background/40 px-4 pt-16">
            <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 text-center shadow-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-primary">
                {locked.length} more {locked.length === 1 ? "bike" : "bikes"}
              </p>
              <h3 className="mt-2 font-serif text-xl tracking-tight text-card-foreground">
                Subscribe free to see the full collection
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Join the newsletter and unlock every find, plus new bikes in
                your inbox.
              </p>
              <SubscribeForm
                source="gallery-gate"
                next="/#gallery"
                className="mt-4"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
