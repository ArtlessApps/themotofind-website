"use server"

import { db } from "@/lib/db"
import { motorcycles } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { hasValidSession } from "@/lib/session"

async function requireSession() {
  if (!(await hasValidSession())) throw new Error("Unauthorized")
}

export type MotorcycleInput = {
  title: string
  make?: string
  model?: string
  year?: number | null
  price?: string
  location?: string
  mileage?: string
  description?: string
  imageUrl: string
  listingUrl: string
  featured?: boolean
}

// Public: read every listing for the gallery (no auth — the gallery is public).
export async function getPublicMotorcycles() {
  return db
    .select()
    .from(motorcycles)
    .orderBy(desc(motorcycles.featured), desc(motorcycles.createdAt))
}

// Admin: single curator, so this just returns everything.
export async function getMyMotorcycles() {
  await requireSession()
  return db.select().from(motorcycles).orderBy(desc(motorcycles.createdAt))
}

export async function createMotorcycle(input: MotorcycleInput) {
  await requireSession()
  await db.insert(motorcycles).values({
    title: input.title,
    make: input.make || null,
    model: input.model || null,
    year: input.year ?? null,
    price: input.price || null,
    location: input.location || null,
    mileage: input.mileage || null,
    description: input.description || null,
    imageUrl: input.imageUrl,
    listingUrl: input.listingUrl,
    featured: input.featured ?? false,
  })
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function updateMotorcycle(id: number, input: MotorcycleInput) {
  await requireSession()
  await db
    .update(motorcycles)
    .set({
      title: input.title,
      make: input.make || null,
      model: input.model || null,
      year: input.year ?? null,
      price: input.price || null,
      location: input.location || null,
      mileage: input.mileage || null,
      description: input.description || null,
      imageUrl: input.imageUrl,
      listingUrl: input.listingUrl,
      featured: input.featured ?? false,
      updatedAt: new Date(),
    })
    .where(eq(motorcycles.id, id))
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function deleteMotorcycle(id: number) {
  await requireSession()
  await db.delete(motorcycles).where(eq(motorcycles.id, id))
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function toggleFeatured(id: number, featured: boolean) {
  await requireSession()
  await db
    .update(motorcycles)
    .set({ featured, updatedAt: new Date() })
    .where(eq(motorcycles.id, id))
  revalidatePath("/")
  revalidatePath("/admin")
}
