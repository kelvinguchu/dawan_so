import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Podcast ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const podcast = await payload.findByID({
      collection: 'podcasts',
      id,
    })

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 })
    }

    const currentUser = await payload.findByID({
      collection: 'users',
      id: user.id,
    })

    const likedPodcasts = (currentUser.likedPodcasts || []).map((p) =>
      typeof p === 'string' ? p : p.id,
    )

    const isLiked = likedPodcasts.includes(id)
    const updatedLikedPodcasts = isLiked
      ? likedPodcasts.filter((podcastId) => podcastId !== id)
      : [...likedPodcasts, id]

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        likedPodcasts: updatedLikedPodcasts,
      },
    })

    const currentLikes = (podcast.likes as number) || 0
    const newLikeCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1

    await payload.update({
      collection: 'podcasts',
      id,
      data: {
        likes: newLikeCount,
      },
    })

    return NextResponse.json({
      success: true,
      liked: !isLiked,
      likeCount: newLikeCount,
    })
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to toggle like',
      },
      { status: 500 },
    )
  }
}
