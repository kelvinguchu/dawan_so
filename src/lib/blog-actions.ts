'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogPost } from '@/payload-types'

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const payload = await getPayload({ config })
  try {
    const response = await payload.find({
      collection: 'blogPosts',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 5,
    })
    return response.docs[0] || null
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return null
  }
}

export async function getRelatedPosts(
  categoryIds: string[],
  currentPostId: string,
): Promise<BlogPost[]> {
  if (!categoryIds || categoryIds.length === 0) return []
  const payload = await getPayload({ config })
  try {
    const response = await payload.find({
      collection: 'blogPosts',
      where: {
        and: [
          {
            categories: {
              in: categoryIds,
            },
          },
          {
            id: {
              not_equals: currentPostId,
            },
          },
          {
            status: { equals: 'published' },
          },
        ],
      },
      limit: 3,
      sort: '-createdAt',
      depth: 1,
    })
    return response.docs
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}
