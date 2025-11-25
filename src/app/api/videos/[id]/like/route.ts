import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const video = await payload.findByID({
      collection: 'headlineVideos',
      id,
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const currentUser = (await payload.findByID({
      collection: 'users',
      id: user.id,
    })) 

    const likedVideos = (currentUser.likedVideos || []).map((v) =>
      typeof v === 'string' ? v : v.id,
    )

    const isLiked = likedVideos.includes(id)
    const updatedLikedVideos = isLiked
      ? likedVideos.filter((videoId) => videoId !== id)
      : [...likedVideos, id]

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        likedVideos: updatedLikedVideos,
      },
    })

    const currentLikes = (video.likes as number) || 0
    const newLikeCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1

    await payload.update({
      collection: 'headlineVideos',
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
