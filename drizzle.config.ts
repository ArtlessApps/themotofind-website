import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig } from "drizzle-kit"

// Next.js loads .env.local automatically; drizzle-kit does not.
for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file)
  if (!existsSync(path)) continue
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    if (process.env[key]) continue
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing or empty in .env.local.\n\n" +
      "1) Pull production env vars (not development — those are empty on this project):\n" +
      "   vercel env pull .env.local --environment=production\n\n" +
      "2) If DATABASE_URL is still empty, your Neon integration did not populate values.\n" +
      "   Open Neon from Vercel: vercel integration open neon neon-cyan-grass\n" +
      "   Copy the pooled connection string and set DATABASE_URL in .env.local.\n\n" +
      "   Also add it in Vercel > themotofind > Settings > Environment Variables\n" +
      "   for Development so plain `vercel env pull` works next time."
  )
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
})
