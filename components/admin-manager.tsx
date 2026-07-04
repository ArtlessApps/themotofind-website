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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, X, Star, ExternalLink } from "lucide-react"

const empty: MotorcycleInput = {
  title: "",
  make: "",
  model: "",
  year: null,
  price: "",
  location: "",
  mileage: "",
  description: "",
  imageUrl: "",
  listingUrl: "",
  featured: false,
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
      title: bike.title,
      make: bike.make ?? "",
      model: bike.model ?? "",
      year: bike.year,
      price: bike.price ?? "",
      location: bike.location ?? "",
      mileage: bike.mileage ?? "",
      description: bike.description ?? "",
      imageUrl: bike.imageUrl,
      listingUrl: bike.listingUrl,
      featured: bike.featured,
    })
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.imageUrl || !form.listingUrl) {
      toast.error("Title, image URL, and listing URL are required.")
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
      } catch {
        toast.error("Something went wrong. Please try again.")
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
              Add your first motorcycle to populate the gallery.
            </p>
            <Button onClick={openCreate} className="mt-6">
              <Plus className="size-4" />
              Add motorcycle
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {bikes.map((bike) => {
              const subtitle = [bike.year, bike.make, bike.model].filter(Boolean).join(" ")
              return (
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
                      <p className="truncate font-medium text-card-foreground">
                        {bike.title}
                      </p>
                      {bike.featured && (
                        <Star className="size-3.5 shrink-0 fill-primary text-primary" />
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {[subtitle, bike.price, bike.location].filter(Boolean).join(" · ")}
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
                          bike.featured
                            ? "size-4 fill-primary text-primary"
                            : "size-4"
                        }
                      />
                    </Button>
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
              )
            })}
          </ul>
        )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-lg border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl tracking-tight text-card-foreground">
                {editingId ? "Edit listing" : "Add motorcycle"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFormOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="1975 Honda CB550 Cafe Racer"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={form.make}
                    onChange={(e) => setForm({ ...form, make: e.target.value })}
                    placeholder="Honda"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="CB550"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={form.year ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        year: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="1975"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="$8,500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Austin, TX"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    value={form.mileage}
                    onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                    placeholder="12,400 mi"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="imageUrl">Image URL *</Label>
                <Input
                  id="imageUrl"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="listingUrl">Listing URL *</Label>
                <Input
                  id="listingUrl"
                  value={form.listingUrl}
                  onChange={(e) => setForm({ ...form, listingUrl: e.target.value })}
                  placeholder="https://... (where buyers go)"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What makes this one special..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label htmlFor="featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">
                    Pin to the top of the gallery.
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : editingId ? "Save changes" : "Add listing"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
