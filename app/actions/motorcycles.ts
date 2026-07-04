"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { motorcycles } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
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

// Public: read every listing for the gallery (no user scoping — the gallery is public).
export async function getPublicMotorcycles() {
  return db
    .select()
    .from(motorcycles)
    .orderBy(desc(motorcycles.featured), desc(motorcycles.createdAt))
}

// Admin: read only the signed-in curator's listings.
export async function getMyMotorcycles() {
  const userId = await getUserId()
  return db
    .select()
    .from(motorcycles)
    .where(eq(motorcycles.userId, userId))
    .orderBy(desc(motorcycles.createdAt))
}

export async function createMotorcycle(input: MotorcycleInput) {
  const userId = await getUserId()
  await db.insert(motorcycles).values({
    userId,
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
  const userId = await getUserId()
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
    .where(and(eq(motorcycles.id, id), eq(motorcycles.userId, userId)))
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function deleteMotorcycle(id: number) {
  const userId = await getUserId()
  await db
    .delete(motorcycles)
    .where(and(eq(motorcycles.id, id), eq(motorcycles.userId, userId)))
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function toggleFeatured(id: number, featured: boolean) {
  const userId = await getUserId()
  await db
    .update(motorcycles)
    .set({ featured, updatedAt: new Date() })
    .where(and(eq(motorcycles.id, id), eq(motorcycles.userId, userId)))
  revalidatePath("/")
  revalidatePath("/admin")
}
