"use client"

import { useActionState } from "react"
import { subscribe, type SubscribeState } from "@/app/actions/subscribe"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const initialState: SubscribeState = { error: null }

export function SubscribeForm({
  source,
  next = "/",
  className,
  buttonLabel = "Subscribe free",
}: {
  source?: string
  next?: string
  className?: string
  buttonLabel?: string
}) {
  const [state, formAction, isPending] = useActionState(subscribe, initialState)

  return (
    <form
      action={formAction}
      className={cn("flex flex-col gap-2 sm:flex-row sm:items-start", className)}
    >
      <input type="hidden" name="next" value={next} />
      {source && <input type="hidden" name="source" value={source} />}
      <Input
        type="email"
        name="email"
        placeholder="you@email.com"
        required
        autoComplete="email"
        aria-invalid={state.error ? true : undefined}
        className="h-10 sm:flex-1"
      />
      <Button type="submit" disabled={isPending} size="lg" className="h-10 whitespace-nowrap">
        {isPending ? "Joining..." : buttonLabel}
      </Button>
      {state.error && (
        <p className="text-sm text-destructive sm:basis-full" role="alert">
          {state.error}
        </p>
      )}
    </form>
  )
}
