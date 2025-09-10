'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogPost, BlogCategory } from '@/payload-types'
import { subDays } from 'date-fns'

export interface HomePageData {
  latestPost: BlogPost | null
  heroPosts: BlogPost[]
  trendingPosts: BlogPost[]
  editorsPicks: BlogPost[]
  recentNews: BlogPost[]
  categoriesWithPosts: Array<BlogCategory & { latestPost: BlogPost }>
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

    const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
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
              greater_than: thirtyDaysAgo,
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
            featuredinhomepage: { equals: true },
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

    return {
      latestPost,
      heroPosts,
      trendingPosts: trendingPostsResponse.docs,
      editorsPicks: editorsPicksResponse.docs,
      recentNews: recentNewsResponse.docs,
      categoriesWithPosts,
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

    const categoriesResponse = await payload.find({
      collection: 'blogCategories',
      limit: 100,
    })

    const categories = categoriesResponse.docs

    const postsWithCategoriesResponse = await payload.find({
      collection: 'blogPosts',
      limit: 100,
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

    const postsWithCategories = postsWithCategoriesResponse.docs.filter(
      (post) => post.categories && Array.isArray(post.categories) && post.categories.length > 0,
    )

    const categoryPostMap = new Map<string, { category: BlogCategory; latestPost: BlogPost }>()

    postsWithCategories.forEach((post) => {
      if (post.categories && Array.isArray(post.categories)) {
        post.categories.forEach((cat) => {
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
        })
      }
    })

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
