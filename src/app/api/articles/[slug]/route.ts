import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Fetch the article with full content
    const response = await payload.find({
      collection: 'blogPosts',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      limit: 1,
      depth: 2,
    })

    const post = response.docs[0]

    if (!post) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Fetch related posts in parallel
    const categoryIds = (post.categories ?? [])
      .map((cat) => (typeof cat === 'string' ? cat : cat?.id))
      .filter((id): id is string => id != null)

    let relatedPosts: typeof response.docs = []

    if (categoryIds.length > 0) {
      const relatedResponse = await payload.find({
        collection: 'blogPosts',
        where: {
          and: [
            { categories: { in: categoryIds } },
            { id: { not_equals: post.id } },
            { status: { equals: 'published' } },
          ],
        },
        limit: 8,
        sort: '-createdAt',
        depth: 1,
      })
      relatedPosts = relatedResponse.docs
    }

    return NextResponse.json(
      {
        post,
        relatedPosts,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    )
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}
