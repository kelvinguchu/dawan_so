'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { Podcast } from '@/payload-types'

interface PodcastQueryOptions {
  page?: number
  limit?: number
  searchTerm?: string
  category?: string
  series?: string
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
  series?: { equals: string }
}

export async function getPodcasts({
  page = 1,
  limit = 20,
  searchTerm,
  category,
  series,
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

    if (series && series !== 'all') {
      whereConditions.push({
        series: {
          equals: series,
        },
      })
    }

    let sort = '-publishedAt'
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
