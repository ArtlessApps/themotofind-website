import type { Motorcycle } from "@/lib/db/schema"
import { ArrowUpRight, MapPin } from "lucide-react"

export function MotorcycleCard({ bike }: { bike: Motorcycle }) {
  const subtitle = [bike.year, bike.make, bike.model].filter(Boolean).join(" ")

  return (
    <a
      href={bike.listingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bike.imageUrl || "/placeholder.svg"}
          alt={bike.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {bike.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-primary-foreground">
            Featured
          </span>
        )}
        {bike.price && (
          <span className="absolute bottom-3 right-3 rounded-md bg-background/85 px-2.5 py-1 text-sm font-semibold text-foreground backdrop-blur-sm">
            {bike.price}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg leading-tight text-card-foreground text-balance">
            {bike.title}
          </h3>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-3 text-xs text-muted-foreground">
          {bike.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {bike.location}
            </span>
          )}
          {bike.mileage && <span>{bike.mileage}</span>}
        </div>
      </div>
    </a>
  )
}
