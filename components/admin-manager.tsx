"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Motorcycle } from "@/lib/db/schema"
import {
  createMotorcycle,
  updateMotorcycle,
  deleteMotorcycle,
  toggleFeatured,
  type MotorcycleInput,
} from "@/app/actions/motorcycles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, X, Star, ExternalLink } from "lucide-react"
import { InstagramIcon } from "@/components/instagram-icon"

const empty: MotorcycleInput = {
  instagramUrl: "",
  listingUrl: "",
}

export function AdminManager({
  initialBikes,
}: {
  initialBikes: Motorcycle[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<MotorcycleInput>(empty)

  const bikes = initialBikes

  function openCreate() {
    setEditingId(null)
    setForm(empty)
    setFormOpen(true)
  }

  function openEdit(bike: Motorcycle) {
    setEditingId(bike.id)
    setForm({
      instagramUrl: bike.instagramUrl ?? "",
      listingUrl: bike.listingUrl,
    })
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.instagramUrl.trim() || !form.listingUrl.trim()) {
      toast.error("Instagram post URL and listing URL are required.")
      return
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateMotorcycle(editingId, form)
          toast.success("Listing updated.")
        } else {
          await createMotorcycle(form)
          toast.success("Listing added.")
        }
        setFormOpen(false)
        setForm(empty)
        setEditingId(null)
        router.refresh()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        toast.error(message)
      }
    })
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this listing? This cannot be undone.")) return
    startTransition(async () => {
      try {
        await deleteMotorcycle(id)
        toast.success("Listing deleted.")
        router.refresh()
      } catch {
        toast.error("Could not delete listing.")
      }
    })
  }

  function handleToggleFeatured(bike: Motorcycle) {
    startTransition(async () => {
      try {
        await toggleFeatured(bike.id, !bike.featured)
        router.refresh()
      } catch {
        toast.error("Could not update listing.")
      }
    })
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-foreground">
            Your Listings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {bikes.length} {bikes.length === 1 ? "motorcycle" : "motorcycles"} in the gallery
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add motorcycle
        </Button>
      </div>

      {bikes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-20 text-center">
          <p className="font-serif text-xl text-foreground">No listings yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste an Instagram post and listing link to populate the gallery.
          </p>
          <Button onClick={openCreate} className="mt-6">
            <Plus className="size-4" />
            Add motorcycle
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {bikes.map((bike) => (
            <li
              key={bike.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-3"
            >
              <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bike.imageUrl || "/placeholder.svg"}
                  alt={bike.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-card-foreground">{bike.title}</p>
                  {bike.featured && (
                    <Star className="size-3.5 shrink-0 fill-primary text-primary" />
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  Gallery links to listing
                  {bike.instagramUrl ? " · sourced from Instagram" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  title={bike.featured ? "Unfeature" : "Feature"}
                  onClick={() => handleToggleFeatured(bike)}
                  disabled={isPending}
                >
                  <Star
                    className={
                      bike.featured ? "size-4 fill-primary text-primary" : "size-4"
                    }
                  />
                </Button>
                {bike.instagramUrl && (
                  <Button variant="ghost" size="icon" asChild title="View Instagram post">
                    <a href={bike.instagramUrl} target="_blank" rel="noopener noreferrer">
                      <InstagramIcon className="size-4" />
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" asChild title="View listing">
                  <a href={bike.listingUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Edit"
                  onClick={() => openEdit(bike)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete"
                  onClick={() => handleDelete(bike.id)}
                  disabled={isPending}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-lg border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl tracking-tight text-card-foreground">
                {editingId ? "Edit listing" : "Add motorcycle"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setFormOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>

            <p className="mb-6 text-sm text-muted-foreground">
              Paste your Instagram post and the marketplace listing. The first carousel photo
              becomes the gallery image; visitors click through to the listing.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="instagramUrl">Instagram post *</Label>
                <Input
                  id="instagramUrl"
                  value={form.instagramUrl}
                  onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                  placeholder="https://www.instagram.com/p/…"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="listingUrl">Listing URL *</Label>
                <Input
                  id="listingUrl"
                  value={form.listingUrl}
                  onChange={(e) => setForm({ ...form, listingUrl: e.target.value })}
                  placeholder="https://… (Craigslist, eBay, etc.)"
                  required
                />
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? "Fetching from Instagram..."
                    : editingId
                      ? "Save changes"
                      : "Add to gallery"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
