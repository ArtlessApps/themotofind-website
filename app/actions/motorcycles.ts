"use server"

import { db } from "@/lib/db"
import { motorcycles } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { resolveInstagramPost } from "@/lib/instagram"
import { hasValidSession } from "@/lib/session"

async function requireSession() {
  if (!(await hasValidSession())) throw new Error("Unauthorized")
}

export type MotorcycleInput = {
  instagramUrl: string
  listingUrl: string
  featured?: boolean
}

function normalizeListingUrl(url: string): string {
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid listing URL")
    }
    return parsed.toString()
  } catch {
    throw new Error("Enter a valid listing URL.")
  }
}

async function resolveListingFields(input: MotorcycleInput) {
  const listingUrl = normalizeListingUrl(input.listingUrl)
  const { imageUrl, title, postUrl } = await resolveInstagramPost(input.instagramUrl)

  return {
    title,
    imageUrl,
    instagramUrl: postUrl,
    listingUrl,
    featured: input.featured ?? false,
  }
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
  const fields = await resolveListingFields(input)
  await db.insert(motorcycles).values(fields)
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function updateMotorcycle(id: number, input: MotorcycleInput) {
  await requireSession()
  const fields = await resolveListingFields(input)
  await db
    .update(motorcycles)
    .set({ ...fields, updatedAt: new Date() })
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
