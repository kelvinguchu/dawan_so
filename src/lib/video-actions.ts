'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { HeadlineVideo } from '@/payload-types'

interface VideoQueryOptions {
  page?: number
  limit?: number
  searchTerm?: string
}

interface VideoResponse {
  docs: HeadlineVideo[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type WhereCondition = {
  or?: Array<{
    title?: { contains: string }
    description?: { contains: string }
  }>
}

const DEFAULT_LIMIT = 18

export async function getVideos({
  page = 1,
  limit = DEFAULT_LIMIT,
  searchTerm,
}: VideoQueryOptions = {}): Promise<VideoResponse> {
  const payload = await getPayload({ config })

  const where: WhereCondition = {}

  if (searchTerm) {
    where.or = [
      {
        title: { contains: searchTerm },
      },
      {
        description: { contains: searchTerm },
      },
    ]
  }

  const response = await payload.find({
    collection: 'headlineVideos',
    page,
    limit,
    sort: '-createdAt',
    ...(searchTerm ? { where } : {}),
  })

  return {
    docs: response.docs as unknown as HeadlineVideo[],
    totalDocs: response.totalDocs ?? 0,
    totalPages: response.totalPages ?? 1,
    page: response.page ?? 1,
    hasNextPage: response.hasNextPage ?? false,
    hasPrevPage: response.hasPrevPage ?? false,
  }
}

export async function getVideoById(id: string): Promise<HeadlineVideo | null> {
  if (!id) return null

  try {
    const payload = await getPayload({ config })
    const video = await payload.findByID({
      collection: 'headlineVideos',
      id,
    })
    return video as unknown as HeadlineVideo
  } catch (error) {
    console.error('Error fetching video by id:', error)
    return null
  }
}
