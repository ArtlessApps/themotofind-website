"use server"

import { db } from "@/lib/db"
import { listings } from "@/lib/db/schema"
import { and, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { hasValidSession } from "@/lib/session"
import type { ListingStatus } from "@/lib/listing-status"

async function requireSession() {
  if (!(await hasValidSession())) throw new Error("Unauthorized")
}

export type ListingStats = {
  total: number
  flagged: number
  approved: number
  pendingReview: number
  today: number
}

// Mirrors motofinds/dashboard/app.py's dashboard() route: only AI-flagged
// listings show up in the curation queue, filtered by curator status.
export async function getCuratedListings(status: ListingStatus = "pending") {
  await requireSession()
  return db
    .select()
    .from(listings)
    .where(and(eq(listings.aiFlagged, true), eq(listings.status, status)))
    .orderBy(desc(listings.aiScore), desc(listings.scrapedAt))
    .limit(100)
}

export async function getListingStats(): Promise<ListingStats> {
  await requireSession()
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      flagged: sql<number>`count(*) filter (where ${listings.aiFlagged} = true)::int`,
      approved: sql<number>`count(*) filter (where ${listings.status} = 'approved')::int`,
      pendingReview: sql<number>`count(*) filter (where ${listings.status} = 'pending' and ${listings.aiFlagged} = true)::int`,
      today: sql<number>`count(*) filter (where ${listings.scrapedAt}::date = current_date)::int`,
    })
    .from(listings)

  return (
    row ?? { total: 0, flagged: 0, approved: 0, pendingReview: 0, today: 0 }
  )
}

export async function updateListingStatus(
  id: number,
  status: ListingStatus,
  notes?: string
) {
  await requireSession()
  await db
    .update(listings)
    .set({ status, notes: notes ?? null, reviewedAt: new Date() })
    .where(eq(listings.id, id))
  revalidatePath("/admin/curation")
}
