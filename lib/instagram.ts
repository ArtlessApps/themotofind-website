const INSTAGRAM_POST_RE =
  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels)\/([A-Za-z0-9_-]+)/i

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  Accept: "text/html",
}

export function normalizeInstagramUrl(url: string): string {
  const trimmed = url.trim()
  const match = trimmed.match(INSTAGRAM_POST_RE)
  if (!match) {
    throw new Error("Enter a valid Instagram post URL (e.g. instagram.com/p/…)")
  }
  const type = match[2] === "reels" ? "reel" : match[2]
  return `https://www.instagram.com/${type}/${match[3]}/`
}

function parseImageIndex(url: string): number {
  const match = url.match(/[?&]img_index=(\d+)/i)
  return match ? Math.max(1, Number(match[1])) : 1
}

function cleanInstagramTitle(ogTitle?: string): string {
  if (!ogTitle) return ""
  const quoted = ogTitle.match(/:\s*"([^"]+)"/)?.[1]
  if (quoted) return quoted.trim()
  const afterColon = ogTitle.split(":").pop()?.trim()
  return afterColon?.replace(/^["']|["']$/g, "") || ogTitle.trim()
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

function unescapeJsonString(value: string): string {
  return JSON.parse(`"${value}"`)
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

function carouselImageIds(html: string): string[] {
  const ids: string[] = []
  const seen = new Set<string>()
  for (const match of html.matchAll(/(\d+_\d+_\d+_n\.jpg)/g)) {
    const id = match[1]
    if (seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids
}

function urlsForImageId(html: string, imageId: string): string[] {
  const escaped = imageId.replace(/\./g, "\\.")
  const pattern = new RegExp(`https:\\\\/\\\\/scontent[^"]+${escaped}[^"]*`, "g")
  const urls = new Set<string>()
  for (const match of html.matchAll(pattern)) {
    urls.add(unescapeJsonString(match[0]))
  }
  return [...urls]
}

function pickBestImageUrl(urls: string[]): string | undefined {
  const scored = urls.map((url) => {
    const stp = url.match(/stp=([^&]+)/)?.[1] ?? ""
    const cropped = /^c[\d.]/.test(stp)
    const sizeMatch = stp.match(/s(\d+)x(\d+)/) || stp.match(/p(\d+)x(\d+)/)
    const px = sizeMatch
      ? Math.min(Number(sizeMatch[1]), Number(sizeMatch[2]))
      : cropped
        ? 0
        : 10_000
    const score = cropped ? px : stp === "dst-jpg_e35_tt6" ? 20_000 : px
    return { url, cropped, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.find((entry) => !entry.cropped)?.url ?? scored[0]?.url
}

async function fetchViaPageEmbed(postUrl: string, imageIndex: number) {
  const res = await fetch(postUrl, { cache: "no-store", headers: FETCH_HEADERS })
  if (!res.ok) {
    throw new Error("Could not load Instagram post. Check the URL is public.")
  }

  const html = await res.text()
  const ids = carouselImageIds(html)
  const imageId = ids[imageIndex - 1] ?? ids[0]
  if (imageId) {
    const imageUrl = pickBestImageUrl(urlsForImageId(html, imageId))
    if (imageUrl) {
      const rawTitle = cleanInstagramTitle(metaContent(html, "og:title"))
      return {
        imageUrl,
        title: decodeHtmlEntities(rawTitle) || "Motorcycle listing",
      }
    }
  }

  const ogImage = metaContent(html, "og:image")
  if (!ogImage) {
    throw new Error("Could not find an image for this Instagram post.")
  }

  return {
    imageUrl: ogImage,
    title: decodeHtmlEntities(cleanInstagramTitle(metaContent(html, "og:title"))) || "Motorcycle listing",
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
      decodeHtmlEntities(cleanInstagramTitle(data.title)) ||
      data.author_name ||
      "Motorcycle listing",
  }
}

export async function resolveInstagramPost(url: string) {
  const postUrl = normalizeInstagramUrl(url)
  const imageIndex = parseImageIndex(url)
  const viaPageEmbed = await fetchViaPageEmbed(postUrl, imageIndex)
  if (viaPageEmbed) return { ...viaPageEmbed, postUrl }

  const viaOEmbed = await fetchViaOEmbed(postUrl)
  if (viaOEmbed) return { ...viaOEmbed, postUrl }

  throw new Error("Could not find an image for this Instagram post.")
}
