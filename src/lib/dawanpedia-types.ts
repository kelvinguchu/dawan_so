/**
 * Dawanpedia Types - Safe to import in client components
 * These types don't import any server-side dependencies
 */

// Temporary type until payload-types.ts is regenerated
export interface DawanpediaEntry {
  id: string
  name: string
  slug: string
  status?: 'draft' | 'review' | 'published'
  entryType: 'person' | 'business'
  primaryImage?: unknown
  subtitle?: string
  publishedDate?: string | null
  profileFacts?: Array<{
    label?: string | null
    value?: unknown
  }> | null
  sections?: Array<{
    id?: string | null
    heading: string
    content?: unknown
  }> | null
  timeline?: Array<{
    date?: string | null
    title?: string | null
    description?: unknown
  }> | null
  references?: Array<{
    title?: string | null
    publication?: string | null
    url?: string | null
    accessedDate?: string | null
  }> | null
  relatedContent?: {
    blogPosts?: unknown[] | null
    relatedEntries?: unknown[] | null
  } | null
  seoDescription?: string
  createdAt?: string
  updatedAt?: string
}

export interface DawanpediaEntryWithRelations extends DawanpediaEntry {
  primaryImage?: unknown
  relatedContent?: {
    blogPosts?: unknown[] | null
    relatedEntries?: unknown[] | null
  }
}

export type DawanpediaEntryMetadata = Pick<
  DawanpediaEntry,
  'id' | 'name' | 'entryType' | 'slug' | 'primaryImage' | 'publishedDate' | 'profileFacts'
>

export interface EntryFetchOptions {
  draft?: boolean
  depth?: number
}

/**
 * Resolve a heading to a URL-safe anchor string
 */
export const resolveEntryAnchor = (heading: string, fallback: string): string => {
  const normalised = heading
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')

  return normalised || fallback
}

/**
 * Build a URL path for a dawanpedia entry
 */
export const buildEntryUrl = (entry: Pick<DawanpediaEntry, 'slug'>, anchor?: string): string => {
  const base = `/dp/${entry.slug}`
  return anchor ? `${base}#${anchor}` : base
}
