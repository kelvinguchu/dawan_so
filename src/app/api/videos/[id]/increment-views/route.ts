import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const video = await payload.findByID({
      collection: 'headlineVideos',
      id,
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const currentViews = (video.views as number) || 0
    const newViewCount = currentViews + 1

    await payload.update({
      collection: 'headlineVideos',
      id,
      data: {
        views: newViewCount,
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
