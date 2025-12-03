import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@/payload.config'

// Re-export types and client-safe utilities from types file
export type {
  DawanpediaEntry,
  DawanpediaEntryWithRelations,
  DawanpediaEntryMetadata,
  EntryFetchOptions,
} from './dawanpedia-types'
export { resolveEntryAnchor, buildEntryUrl } from './dawanpedia-types'

import type {
  DawanpediaEntry,
  DawanpediaEntryWithRelations,
  DawanpediaEntryMetadata,
  EntryFetchOptions,
} from './dawanpedia-types'

const COLLECTION = 'dawanpediaEntries' as const
const CACHE_TTL_SECONDS = 300

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
