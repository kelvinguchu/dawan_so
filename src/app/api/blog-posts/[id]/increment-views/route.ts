import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Blog post ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Get current post to check if it exists and get current view count
    const post = await payload.findByID({
      collection: 'blogPosts',
      id,
    })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Increment view count
    const currentViews = (post.views as number) || 0
    const newViewCount = currentViews + 1

    // Update the post with new view count
    await payload.update({
      collection: 'blogPosts',
      id,
      data: {
        views: newViewCount,
      },
      context: {
        skipViewTracking: true,
        skipWorkflowSync: true,
        internalTask: true,
      },
    })

    return NextResponse.json({
      success: true,
      viewCount: newViewCount,
    })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to increment view count',
      },
      { status: 500 },
    )
  }
}
