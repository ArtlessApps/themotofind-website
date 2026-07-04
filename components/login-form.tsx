"use client"

import { useActionState } from "react"
import Link from "next/link"
import { login, type LoginState } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: LoginState = { error: null }

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-serif text-2xl tracking-tight text-foreground"
          >
            The Moto <span className="text-primary">Find</span>
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Curator Access
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-6">
            <h1 className="font-serif text-2xl tracking-tight text-card-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the admin password to manage the gallery and curation queue.
            </p>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={next} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Please wait..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
