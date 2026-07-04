import type { Motorcycle } from "@/lib/db/schema"

export function MotorcycleCard({ bike }: { bike: Motorcycle }) {
  return (
    <a
      href={bike.listingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-primary/50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bike.imageUrl || "/placeholder.svg"}
        alt=""
        className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </a>
  )
}
