const BEEHIIV_API_BASE = "https://api.beehiiv.com/v2"

// Adds an email to the themotofind Beehiiv publication. Treats "already
// subscribed" responses as success so re-subscribing never surfaces an error.
export async function subscribeToBeehiiv(email: string, source?: string): Promise<void> {
  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID

  if (!apiKey || !publicationId) {
    throw new Error(
      "Beehiiv is not configured — set BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID"
    )
  }

  const response = await fetch(
    `${BEEHIIV_API_BASE}/publications/${publicationId}/subscriptions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: "themotofind.com",
        utm_medium: source || "website",
      }),
    }
  )

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    if (response.status === 400 && /already/i.test(body)) return
    throw new Error(`Beehiiv API error (${response.status}): ${body}`)
  }
}
