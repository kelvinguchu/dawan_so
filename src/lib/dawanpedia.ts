import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@/payload.config'
import type { BlogPost, Media } from '@/payload-types'

// Temporary type until payload-types.ts is regenerated
export interface DawanpediaEntry {
  id: string
  name: string
  slug: string
  status?: 'draft' | 'review' | 'published'
  entryType: 'person' | 'business'
  primaryImage?: Media | string | null
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
  references?: Array<{
    title?: string | null
    publication?: string | null
    url?: string | null
    accessedDate?: string | null
  }> | null
  relatedContent?: {
    blogPosts?: (BlogPost | string)[] | null
    relatedEntries?: (DawanpediaEntry | string)[] | null
  } | null
  createdAt?: string
  updatedAt?: string
}

const COLLECTION = 'dawanpediaEntries' as const
const CACHE_TTL_SECONDS = 300

export interface EntryFetchOptions {
  draft?: boolean
  depth?: number
}

export interface DawanpediaEntryWithRelations extends DawanpediaEntry {
  primaryImage?: Media | string | null
  relatedContent?: {
    blogPosts?: (BlogPost | string)[] | null
    relatedEntries?: (DawanpediaEntry | string)[] | null
  }
}

const fetchEntryBySlug = async (
  slug: string,
  options?: EntryFetchOptions,
): Promise<DawanpediaEntryWithRelations> => {
  const payload = await getPayload({ config })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (payload as any).find({
    collection: COLLECTION,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    draft: options?.draft,
    overrideAccess: options?.draft ?? false,
    depth: options?.depth ?? 2,
    pagination: false,
  })

  const entry = response.docs[0]

  if (!entry) {
    throw new Error('DAWANPEDIA_ENTRY_NOT_FOUND')
  }

  return entry as DawanpediaEntryWithRelations
}

export type DawanpediaEntryMetadata = Pick<
  DawanpediaEntry,
  'id' | 'name' | 'entryType' | 'slug' | 'primaryImage' | 'publishedDate' | 'profileFacts'
>

const fetchEntryMetadataBySlug = async (slug: string): Promise<DawanpediaEntryMetadata> => {
  const payload = await getPayload({ config })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (payload as any).find({
    collection: COLLECTION,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 1,
    pagination: false,
    select: {
      id: true,
      name: true,
      slug: true,
      entryType: true,
      primaryImage: true,
      publishedDate: true,
      profileFacts: true,
    },
  })

  const entry = response.docs[0]

  if (!entry) {
    throw new Error('DAWANPEDIA_ENTRY_NOT_FOUND')
  }

  return entry as unknown as DawanpediaEntryMetadata
}

const getEntryBySlugCached = unstable_cache(fetchEntryBySlug, ['dawanpedia-entry-by-slug'], {
  revalidate: CACHE_TTL_SECONDS,
})

const getEntryMetadataBySlugCached = unstable_cache(
  fetchEntryMetadataBySlug,
  ['dawanpedia-entry-metadata-by-slug'],
  {
    revalidate: CACHE_TTL_SECONDS,
  },
)

export const getDawanpediaEntry = async (
  slug: string,
  options?: EntryFetchOptions,
): Promise<DawanpediaEntryWithRelations | null> => {
  try {
    if (options?.draft) {
      return await fetchEntryBySlug(slug, options)
    }

    return await getEntryBySlugCached(slug, options)
  } catch (error) {
    if (error instanceof Error && error.message === 'DAWANPEDIA_ENTRY_NOT_FOUND') {
      return null
    }

    console.error('Failed to fetch Dawanpedia entry:', error)
    return null
  }
}

export const getDawanpediaEntryMetadata = async (
  slug: string,
): Promise<Pick<
  DawanpediaEntry,
  'id' | 'name' | 'entryType' | 'slug' | 'primaryImage' | 'publishedDate' | 'profileFacts'
> | null> => {
  try {
    return await getEntryMetadataBySlugCached(slug)
  } catch (error) {
    if (error instanceof Error && error.message === 'DAWANPEDIA_ENTRY_NOT_FOUND') {
      return null
    }

    console.error('Failed to fetch Dawanpedia metadata:', error)
    return null
  }
}

export const buildEntryPreviewUrl = (
  entry: Pick<DawanpediaEntry, 'slug'>,
  anchor?: string,
): string => {
  const base = `/dp/${entry.slug}`
  return anchor ? `${base}#${anchor}` : base
}

export const resolveEntryAnchor = (heading: string, fallback: string): string => {
  const normalised = heading
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')

  return normalised || fallback
}
