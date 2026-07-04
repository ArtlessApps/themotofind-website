const INSTAGRAM_POST_RE =
  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels)\/([A-Za-z0-9_-]+)/i

export function normalizeInstagramUrl(url: string): string {
  const trimmed = url.trim()
  const match = trimmed.match(INSTAGRAM_POST_RE)
  if (!match) {
    throw new Error("Enter a valid Instagram post URL (e.g. instagram.com/p/…)")
  }
  const type = match[2] === "reels" ? "reel" : match[2]
  return `https://www.instagram.com/${type}/${match[3]}/`
}

function cleanInstagramTitle(ogTitle?: string): string {
  if (!ogTitle) return ""
  const quoted = ogTitle.match(/:\s*"([^"]+)"/)?.[1]
  if (quoted) return quoted.trim()
  const afterColon = ogTitle.split(":").pop()?.trim()
  return afterColon?.replace(/^["']|["']$/g, "") || ogTitle.trim()
}

function metaContent(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(`property="${property}" content="([^"]+)"`, "i"),
    new RegExp(`content="([^"]+)" property="${property}"`, "i"),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1].replace(/&amp;/g, "&")
  }
}

async function fetchViaOEmbed(postUrl: string) {
  const token = process.env.INSTAGRAM_OEMBED_TOKEN
  if (!token) return null

  const oembedUrl = new URL("https://graph.facebook.com/v21.0/instagram_oembed")
  oembedUrl.searchParams.set("url", postUrl)
  oembedUrl.searchParams.set("access_token", token)
  oembedUrl.searchParams.set("fields", "thumbnail_url,title,author_name")

  const res = await fetch(oembedUrl.toString(), { cache: "no-store" })
  if (!res.ok) return null

  const data = (await res.json()) as {
    thumbnail_url?: string
    title?: string
    author_name?: string
  }

  if (!data.thumbnail_url) return null

  return {
    imageUrl: data.thumbnail_url,
    title:
      cleanInstagramTitle(data.title) ||
      data.author_name ||
      "Motorcycle listing",
  }
}

async function fetchViaOpenGraph(postUrl: string) {
  const res = await fetch(postUrl, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      Accept: "text/html",
    },
  })
  if (!res.ok) {
    throw new Error("Could not load Instagram post. Check the URL is public.")
  }

  const html = await res.text()
  const imageUrl = metaContent(html, "og:image")
  if (!imageUrl) {
    throw new Error("Could not find an image for this Instagram post.")
  }

  return {
    imageUrl,
    title: cleanInstagramTitle(metaContent(html, "og:title")) || "Motorcycle listing",
  }
}

export async function resolveInstagramPost(url: string) {
  const postUrl = normalizeInstagramUrl(url)
  const viaOEmbed = await fetchViaOEmbed(postUrl)
  if (viaOEmbed) return { ...viaOEmbed, postUrl }
  const viaOpenGraph = await fetchViaOpenGraph(postUrl)
  return { ...viaOpenGraph, postUrl }
}
