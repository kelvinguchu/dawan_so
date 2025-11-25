'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { Podcast, PodcastPlaylist } from '@/payload-types'

interface PodcastQueryOptions {
  page?: number
  limit?: number
  searchTerm?: string
  category?: string
  playlist?: string
  sortBy?: string
}

interface PodcastsResponse {
  docs: Podcast[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type WhereCondition = {
  isPublished?: { equals: boolean }
  or?: Array<{
    title?: { contains: string }
    description?: { contains: string }
  }>
  categories?: { contains: string }
  playlist?: { equals: string }
}

export async function getPodcasts({
  page = 1,
  limit = 20,
  searchTerm,
  category,
  playlist,
  sortBy,
}: PodcastQueryOptions = {}): Promise<PodcastsResponse> {
  try {
    const payload = await getPayload({ config })

    const whereConditions: WhereCondition[] = [
      {
        isPublished: { equals: true },
      },
    ]

    if (searchTerm) {
      whereConditions.push({
        or: [
          {
            title: {
              contains: searchTerm,
            },
          },
          {
            description: {
              contains: searchTerm,
            },
          },
        ],
      })
    }

    if (category && category !== 'all') {
      whereConditions.push({
        categories: {
          contains: category,
        },
      })
    }

    if (playlist && playlist !== 'all') {
      whereConditions.push({
        playlist: {
          equals: playlist,
        },
      })
    }
    let sort: string
    switch (sortBy) {
      case 'oldest':
        sort = 'publishedAt'
        break
      case 'duration':
        sort = '-duration'
        break
      case 'popularity':
        sort = '-playCount'
        break
      case 'newest':
      default:
        sort = '-publishedAt'
        break
    }

    const response = await payload.find({
      collection: 'podcasts',
      where: {
        and: whereConditions,
      },
      limit,
      page,
      sort,
      depth: 2,
    })

    return {
      docs: response.docs,
      totalDocs: response.totalDocs ?? 0,
      totalPages: response.totalPages ?? 1,
      page: response.page ?? 1,
      hasNextPage: response.hasNextPage ?? false,
      hasPrevPage: response.hasPrevPage ?? false,
    }
  } catch (error) {
    console.error('Error fetching podcasts:', error)
    throw error
  }
}

export async function getPodcastBySlug(slug: string): Promise<Podcast | null> {
  if (!slug) return null

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'podcasts',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 2,
    })

    return result.docs[0] || null
  } catch (error) {
    console.error('Error fetching podcast by slug:', error)
    return null
  }
}

export interface PlaylistWithCount extends PodcastPlaylist {
  count: number
}

export async function getPlaylists(): Promise<PlaylistWithCount[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'podcastPlaylists',
      sort: 'name',
      depth: 1,
    })

    const playlistsWithCounts = await Promise.all(
      result.docs.map(async (playlist) => {
        const countResult = await payload.find({
          collection: 'podcasts',
          where: {
            playlist: {
              equals: playlist.id,
            },
            isPublished: {
              equals: true,
            },
          },
          limit: 0,
        })

        return {
          ...playlist,
          count: countResult.totalDocs,
        }
      }),
    )

    return playlistsWithCounts
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return []
  }
}

export async function getPlaylistById(id: string): Promise<PodcastPlaylist | null> {
  if (!id) return null
  try {
    const payload = await getPayload({ config })
    const result = await payload.findByID({
      collection: 'podcastPlaylists',
      id,
      depth: 1,
    })
    return result
  } catch (error) {
    console.error('Error fetching playlist by id:', error)
    return null
  }
}
