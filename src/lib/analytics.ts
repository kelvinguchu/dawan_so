'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import type { BlogPost } from '@/payload-types'

export interface ViewTrackingResult {
  success: boolean
  error?: string
  viewCount?: number
}

export async function incrementPostViewCount(postId: string): Promise<ViewTrackingResult> {
  try {
    const payload = await getPayload({ config })

    // Get current post to check if it exists and get current view count
    const post = (await payload.findByID({
      collection: 'blogPosts',
      id: postId,
      select: {
        views: true,
      },
    })) as Pick<BlogPost, 'views'>

    if (!post) {
      return {
        success: false,
        error: 'Post not found',
      }
    }

    // Increment view count
    const currentViews = post.views || 0
    const newViewCount = currentViews + 1

    // Update the post with new view count
    await payload.update({
      collection: 'blogPosts',
      id: postId,
      data: {
        views: newViewCount,
      },
      context: {
        // Prevent hooks from triggering unnecessary operations
        skipViewTracking: true,
      },
    })

    return {
      success: true,
      viewCount: newViewCount,
    }
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function trackPageView(
  postId: string,
  _userAgent?: string,
): Promise<ViewTrackingResult> {
  try {
    return await incrementPostViewCount(postId)
  } catch (error) {
    console.error('Error tracking page view:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
