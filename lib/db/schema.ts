import { pgTable, text, timestamp, boolean, serial, integer } from "drizzle-orm/pg-core"

// --- Gallery -----------------------------------------------------------
// Motorcycles manually curated onto the public site. Single admin — no
// per-user ownership.

export const motorcycles = pgTable("motorcycles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  price: text("price"),
  location: text("location"),
  mileage: text("mileage"),
  description: text("description"),
  instagramUrl: text("instagramUrl"),
  imageUrl: text("imageUrl").notNull(),
  listingUrl: text("listingUrl").notNull(),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export type Motorcycle = typeof motorcycles.$inferSelect

// --- Scraper curation ----------------------------------------------------
// Mirrors the schema the local MotoFinds scraper pipeline (motofinds/) writes
// to. Column names are snake_case to match what the Python side writes via
// raw SQL — do not rename without updating motofinds/database/db.py.

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  platform: text("platform").notNull(),
  title: text("title"),
  price: integer("price"),
  location: text("location"),
  year: integer("year"),
  make: text("make"),
  model: text("model"),
  mileage: integer("mileage"),
  description: text("description"),
  imageUrls: text("image_urls"),
  rawData: text("raw_data"),
  scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull().defaultNow(),

  aiScore: integer("ai_score"),
  aiFlagged: boolean("ai_flagged").notNull().default(false),
  aiReason: text("ai_reason"),
  aiCategory: text("ai_category"),
  scoredAt: timestamp("scored_at", { withTimezone: true }),

  status: text("status").notNull().default("pending"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  notes: text("notes"),
})

export type Listing = typeof listings.$inferSelect
