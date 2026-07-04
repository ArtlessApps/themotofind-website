export const LISTING_STATUSES = ["pending", "approved", "saved", "skipped"] as const
export type ListingStatus = (typeof LISTING_STATUSES)[number]
