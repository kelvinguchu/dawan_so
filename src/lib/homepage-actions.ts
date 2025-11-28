'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogPost, BlogCategory } from '@/payload-types'
import { subDays, subHours } from 'date-fns'

export interface HomePageData {
  latestPost: BlogPost | null
  heroPosts: BlogPost[]
  trendingPosts: BlogPost[]
  editorsPicks: BlogPost[]
  recentNews: BlogPost[]
  categoriesWithPosts: Array<BlogCategory & { latestPost: BlogPost }>
  flashNews: BlogPost[]
}

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const payload = await getPayload({ config })

    const heroPostsResponse = await payload.find({
      collection: 'blogPosts',
      limit: 20,
      sort: '-createdAt',
      depth: 2,
      where: {
        and: [
          {
            status: { equals: 'published' },
          },
          {
            featuredinhomepage: { equals: true },
          },
        ],
      },
    })

    const heroPosts = heroPostsResponse.docs
    const latestPost: BlogPost | null = heroPosts.length > 0 ? heroPosts[0] : null
    const heroPostIds = heroPosts.map((post) => post.id)

    // Trending: highest views from the last 14 days
    const twoWeeksAgo = subDays(new Date(), 14).toISOString()

    const trendingPostsResponse = await payload.find({
      collection: 'blogPosts',
      limit: 6,
      sort: '-views',
      depth: 2,
      where: {
        and: [
          {
            status: { equals: 'published' },
          },
          {
            featuredinhomepage: { equals: true },
          },
          {
            createdAt: {
              greater_than: twoWeeksAgo,
            },
          },
          {
            id: {
              not_in: heroPostIds,
            },
          },
        ],
      },
    })

    const editorsPicksResponse = await payload.find({
      collection: 'blogPosts',
      limit: 6,
      sort: '-createdAt',
      depth: 2,
      where: {
        and: [
          {
            status: { equals: 'published' },
          },
          {
            isEditorsPick: {
              equals: true,
            },
          },
        ],
      },
    })

    const recentNewsResponse = await payload.find({
      collection: 'blogPosts',
      limit: 12,
      sort: '-createdAt',
      depth: 2,
      where: {
        and: [
          {
            status: { equals: 'published' },
          },
          {
            featuredinhomepage: { equals: true },
          },
          {
            id: {
              not_in: heroPostIds,
            },
          },
        ],
      },
    })

    const categoriesWithPosts = await getCategoriesWithLatestPosts()

    const twentyFourHoursAgo = subHours(new Date(), 24).toISOString()
    const flashNewsResponse = await payload.find({
      collection: 'blogPosts',
      limit: 10,
      sort: '-createdAt',
      depth: 1,
      where: {
        and: [
          {
            status: { equals: 'published' },
          },
          {
            createdAt: {
              greater_than: twentyFourHoursAgo,
            },
          },
        ],
      },
    })

    return {
      latestPost,
      heroPosts,
      trendingPosts: trendingPostsResponse.docs,
      editorsPicks: editorsPicksResponse.docs,
      recentNews: recentNewsResponse.docs,
      categoriesWithPosts,
      flashNews: flashNewsResponse.docs,
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    throw error
  }
}

async function getCategoriesWithLatestPosts(): Promise<
  Array<BlogCategory & { latestPost: BlogPost }>
> {
  try {
    const payload = await getPayload({ config })

    // Run both queries in parallel
    const [categoriesResponse, postsWithCategoriesResponse] = await Promise.all([
      payload.find({
        collection: 'blogCategories',
        limit: 50,
      }),
      payload.find({
        collection: 'blogPosts',
        limit: 50, // Reduced from 100 - we only need 6 categories with posts
        sort: '-createdAt',
        depth: 1, // Reduced from 2
        where: {
          and: [{ status: { equals: 'published' } }, { featuredinhomepage: { equals: true } }],
        },
      }),
    ])

    const categories = categoriesResponse.docs

    const postsWithCategories = postsWithCategoriesResponse.docs.filter(
      (post) => post.categories && Array.isArray(post.categories) && post.categories.length > 0,
    )

    const categoryPostMap = new Map<string, { category: BlogCategory; latestPost: BlogPost }>()

    for (const post of postsWithCategories) {
      if (post.categories && Array.isArray(post.categories)) {
        for (const cat of post.categories) {
          let categoryId: string | null = null
          let categorySlug: string | null = null

          if (typeof cat === 'string') {
            categoryId = cat
            const originalCategory = categories.find((c) => c.id === categoryId)
            if (originalCategory) {
              categorySlug = originalCategory.slug
            }
          } else if (typeof cat === 'object' && cat.id) {
            categoryId = cat.id
            categorySlug = cat.slug
          }

          if (categoryId && categorySlug) {
            const originalCategory = categories.find(
              (c) => c.id === categoryId || c.slug === categorySlug,
            )

            if (originalCategory && !categoryPostMap.has(categorySlug)) {
              categoryPostMap.set(categorySlug, {
                category: originalCategory,
                latestPost: post,
              })
            }
          }
        }
      }
    }

    return Array.from(categoryPostMap.values())
      .slice(0, 6)
      .map(({ category, latestPost }) => ({
        ...category,
        latestPost,
      }))
  } catch (error) {
    console.error('Error fetching categories with posts:', error)
    return []
  }
}
