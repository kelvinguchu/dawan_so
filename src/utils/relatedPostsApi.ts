'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import type { BlogPost, BlogCategory } from '@/payload-types'

interface GetRelatedPostsParams {
  currentPostId: string
  currentPostCategories?: (string | BlogCategory)[] | null
  limit?: number
}

export const getRelatedPostsForView = async ({
  currentPostId,
  currentPostCategories,
  limit = 6,
}: GetRelatedPostsParams): Promise<BlogPost[]> => {
  try {
    const payload = await getPayload({ config })

    const response = await payload.find({
      collection: 'blogPosts',
      where: {
        and: [{ id: { not_equals: currentPostId } }, { status: { equals: 'published' } }],
      },
      limit: limit * 3 > 20 ? limit * 3 : 20,
      sort: '-createdAt',
      depth: 1,
    })

    if (!response.docs || response.docs.length === 0) {
      return []
    }

    const allFetchedPosts: BlogPost[] = response.docs
    let categoryMatches: BlogPost[] = []

    if (
      currentPostCategories &&
      Array.isArray(currentPostCategories) &&
      currentPostCategories.length > 0
    ) {
      const currentCategoryIds = currentPostCategories.map((cat) =>
        typeof cat === 'string' ? cat : (cat as BlogCategory).id,
      )

      categoryMatches = allFetchedPosts.filter((otherPost) => {
        if (
          !otherPost.categories ||
          !Array.isArray(otherPost.categories) ||
          otherPost.categories.length === 0
        ) {
          return false
        }
        const otherPostCategoryIds = otherPost.categories.map((cat) =>
          typeof cat === 'string' ? cat : (cat as BlogCategory).id,
        )
        return otherPostCategoryIds.some((catId) => currentCategoryIds.includes(catId))
      })
    }

    for (let i = categoryMatches.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[categoryMatches[i], categoryMatches[j]] = [categoryMatches[j], categoryMatches[i]]
    }

    if (categoryMatches.length >= limit) {
      return categoryMatches.slice(0, limit)
    }

    const otherPosts = allFetchedPosts.filter(
      (p) => !categoryMatches.some((match) => match.id === p.id) && p.id !== currentPostId,
    )

    for (let i = otherPosts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[otherPosts[i], otherPosts[j]] = [otherPosts[j], otherPosts[i]]
    }

    const neededFromOthers = limit - categoryMatches.length
    const combinedPosts = [...categoryMatches, ...otherPosts.slice(0, neededFromOthers)]

    return combinedPosts.slice(0, limit)
  } catch (error) {
    console.error('Error in getRelatedPostsForView:', error)
    return []
  }
}
