import Link from "next/link"

export function SiteHeader({ isSubscribed = false }: { isSubscribed?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-serif text-xl tracking-tight text-foreground">
          The Moto <span className="text-primary">Find</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/#gallery"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Gallery
          </Link>
          <a
            href="https://instagram.com/themotofind"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            @themotofind
          </a>
          {isSubscribed ? (
            <span className="inline-flex items-center rounded-md border border-primary/40 px-4 py-2 font-medium text-primary">
              ✓ Subscribed
            </span>
          ) : (
            <Link
              href="/#gallery"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Subscribe
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
