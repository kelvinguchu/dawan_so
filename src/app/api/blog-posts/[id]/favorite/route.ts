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

    // Get user's current favorited posts
    const currentUser = (await payload.findByID({
      collection: 'users',
      id: user.id,
    })) as User

    const favoritedPosts = (currentUser.favoritedPosts || []).map((p) =>
      typeof p === 'string' ? p : p.id,
    )

    // Toggle favorite
    const isFavorited = favoritedPosts.includes(id)
    const updatedFavoritedPosts = isFavorited
      ? favoritedPosts.filter((postId) => postId !== id)
      : [...favoritedPosts, id]

    // Update user's favorited posts
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        favoritedPosts: updatedFavoritedPosts,
      },
    })

    // Update post's favorite count
    const currentFavorites = (post.favoritesCount as number) || 0
    const newFavoriteCount = isFavorited ? Math.max(0, currentFavorites - 1) : currentFavorites + 1

    await payload.update({
      collection: 'blogPosts',
      id,
      data: {
        favoritesCount: newFavoriteCount,
      },
      context: {
        skipWorkflowSync: true,
        internalTask: true,
      },
    })

    return NextResponse.json({
      success: true,
      favorited: !isFavorited,
      favoriteCount: newFavoriteCount,
    })
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to toggle favorite',
      },
      { status: 500 },
    )
  }
}
