import { getPayload } from 'payload'
import config from '@/payload.config'
import type { BlogCategory, BlogPost } from '@/payload-types'

export async function getFooterData() {
  try {
    const payload = await getPayload({ config })

    const [categoriesResult, postsResult] = await Promise.all([
      payload.find({
        collection: 'blogCategories',
        limit: 5,
        depth: 0,
      }),
      payload.find({
        collection: 'blogPosts',
        limit: 3,
        sort: '-createdAt',
        depth: 2,
        where: {
          status: {
            equals: 'published',
          },
        },
      }),
    ])

    return {
      categories: categoriesResult.docs as BlogCategory[],
      recentPosts: postsResult.docs as BlogPost[],
    }
  } catch (error) {
    console.error('Error fetching footer data:', error)
    return {
      categories: [],
      recentPosts: [],
    }
  }
}
