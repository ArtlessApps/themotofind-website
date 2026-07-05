export const dynamic = "force-dynamic"

import Link from "next/link"
import { getPublicMotorcycles } from "@/app/actions/motorcycles"
import { isSubscribed } from "@/lib/subscriber"
import { SiteHeader } from "@/components/site-header"
import { GatedGallery } from "@/components/gated-gallery"
import { SubscribeForm } from "@/components/subscribe-form"
import { InstagramIcon } from "@/components/instagram-icon"

export default async function HomePage() {
  const [bikes, subscribed] = await Promise.all([
    getPublicMotorcycles(),
    isSubscribed(),
  ])

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader isSubscribed={subscribed} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-motorcycle.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 md:py-40">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-primary">
            Curated from across the country
          </p>
          <h1 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-foreground text-balance sm:text-6xl md:text-7xl">
            The most interesting motorcycles for sale.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Every machine here caught our eye on the feed. Browse the full
            collection and tap through to the original listing to buy.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="#gallery"
              className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse the gallery
            </Link>
            <a
              href="https://instagram.com/themotofind"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <InstagramIcon className="size-4" />
              Follow @themotofind
            </a>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              The Collection
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {bikes.length} {bikes.length === 1 ? "machine" : "machines"} currently listed
            </p>
          </div>
        </div>

        {bikes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-24 text-center">
            <p className="font-serif text-xl text-foreground">
              The garage is warming up.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              No motorcycles have been added yet. Check back soon.
            </p>
          </div>
        ) : (
          <GatedGallery bikes={bikes} isSubscribed={subscribed} />
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            The Moto Find Newsletter
          </p>
          <h2 className="max-w-2xl font-serif text-3xl leading-tight tracking-tight text-foreground text-balance sm:text-4xl">
            Get the best finds delivered to your inbox.
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground text-pretty">
            Join the list for a hand-picked roundup of the most interesting
            motorcycles for sale, straight from the feed.
          </p>
          {subscribed ? (
            <p className="text-sm font-medium text-primary">
              ✓ You&apos;re subscribed — thanks for riding with us.
            </p>
          ) : (
            <SubscribeForm
              source="bottom-cta"
              next="/#gallery"
              buttonLabel="Subscribe to the newsletter"
              className="w-full max-w-md"
            />
          )}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6">
          <p className="font-serif text-lg text-foreground">
            The Moto <span className="text-primary">Find</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Listings link to third-party sellers. We are not affiliated with any seller.
          </p>
        </div>
      </footer>
    </div>
  )
}
