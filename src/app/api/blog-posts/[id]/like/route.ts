import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Blog post ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Get authenticated user from the request
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get current post
    const post = await payload.findByID({
      collection: 'blogPosts',
      id,
    })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Get user's current liked posts
    const currentUser = (await payload.findByID({
      collection: 'users',
      id: user.id,
    })) as User

    const likedPosts = (currentUser.likedPosts || []).map((p) => (typeof p === 'string' ? p : p.id))

    // Toggle like
    const isLiked = likedPosts.includes(id)
    const updatedLikedPosts = isLiked
      ? likedPosts.filter((postId) => postId !== id)
      : [...likedPosts, id]

    // Update user's liked posts
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        likedPosts: updatedLikedPosts,
      },
    })

    // Update post's like count
    const currentLikes = (post.likes as number) || 0
    const newLikeCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1

    await payload.update({
      collection: 'blogPosts',
      id,
      data: {
        likes: newLikeCount,
      },
      context: {
        skipWorkflowSync: true,
        internalTask: true,
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
