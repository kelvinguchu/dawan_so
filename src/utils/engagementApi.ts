'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import type { User, BlogPost } from '@/payload-types'

interface UpdateUserEngagementParams {
  userId: string
  postId: string
  userEngagementField: keyof Pick<User, 'likedPosts' | 'favoritedPosts'>
  updatedUserEngagementArray: string[]
}

interface TogglePostCountParams {
  postId: string
  postCountField: 'likes' | 'favoritesCount'
  delta: 1 | -1
}

interface EngagementResult {
  userUpdateOk: boolean
  postUpdateOk: boolean
  error?: string
}

export const updateUserAndPostEngagement = async ({
  userId,
  postId,
  userEngagementField,
  updatedUserEngagementArray,
  postCountField,
  delta,
}: UpdateUserEngagementParams & TogglePostCountParams): Promise<EngagementResult> => {
  const result: EngagementResult = {
    userUpdateOk: false,
    postUpdateOk: false,
  }

  try {
    const payload = await getPayload({ config })

    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        [userEngagementField]: updatedUserEngagementArray,
      },
    })
    result.userUpdateOk = true

    const post = (await payload.findByID({
      collection: 'blogPosts',
      id: postId,
      select: {
        likes: true,
        favoritesCount: true,
      },
    })) as Pick<BlogPost, 'likes' | 'favoritesCount'>

    const currentCount = post[postCountField] || 0
    const newCount = Math.max(0, currentCount + delta)

    await payload.update({
      collection: 'blogPosts',
      id: postId,
      data: {
        [postCountField]: newCount,
      },
    })
    result.postUpdateOk = true
  } catch (error) {
    console.error('Error updating user and post engagement:', error)
    result.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return result
}
