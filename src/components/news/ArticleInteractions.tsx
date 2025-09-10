'use client'

import React, { useState, useEffect } from 'react'
import { BlogPost } from '@/payload-types'
import { Bookmark, ThumbsUp, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { updateUserAndPostEngagement } from '@/utils/engagementApi'
import { SharePopoverClient } from './SharePopoverClient'
import { useAuth } from '@/contexts/AuthContext'

interface ArticleInteractionsProps {
  post: BlogPost
  currentUrl: string
}

export const ArticleInteractions: React.FC<ArticleInteractionsProps> = ({ post, currentUrl }) => {
  const router = useRouter()
  const { user: currentUser, isLoading: isLoadingUser, refreshUser } = useAuth()

  const [isFavorited, setIsFavorited] = useState(false)
  const [currentFavoriteCount, setCurrentFavoriteCount] = useState(0)
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false)

  const [isLiked, setIsLiked] = useState(false)
  const [currentLikeCount, setCurrentLikeCount] = useState(0)
  const [isUpdatingLike, setIsUpdatingLike] = useState(false)

  useEffect(() => {
    setCurrentLikeCount(post.likes || 0)
    setCurrentFavoriteCount(post.favoritesCount || 0)
  }, [post.id, post.likes, post.favoritesCount])

  useEffect(() => {
    if (currentUser && post) {
      const favoritedPostIds =
        currentUser.favoritedPosts?.map((p) => (typeof p === 'string' ? p : p.id)) || []
      setIsFavorited(favoritedPostIds.includes(post.id))

      const likedPostIds =
        currentUser.likedPosts?.map((p) => (typeof p === 'string' ? p : p.id)) || []
      setIsLiked(likedPostIds.includes(post.id))
    } else {
      setIsFavorited(false)
      setIsLiked(false)
    }
  }, [currentUser, post.id])

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      router.push('/login?redirect_to=' + encodeURIComponent(window.location.pathname))
      return
    }
    if (isUpdatingFavorite) return

    setIsUpdatingFavorite(true)
    const currentlyFavorited = isFavorited
    const newFavoritedState = !currentlyFavorited
    setCurrentFavoriteCount((prevCount) =>
      Math.max(0, newFavoritedState ? prevCount + 1 : prevCount - 1),
    )
    setIsFavorited(newFavoritedState)

    const originalFavoritedPosts =
      currentUser.favoritedPosts?.map((p) => (typeof p === 'string' ? p : p.id)) || []
    let updatedFavoritedPosts: string[]

    if (currentlyFavorited) {
      updatedFavoritedPosts = originalFavoritedPosts.filter((id) => id !== post.id)
    } else {
      updatedFavoritedPosts = [...originalFavoritedPosts, post.id]
    }

    const { userUpdateOk, postUpdateOk } = await updateUserAndPostEngagement({
      userId: currentUser.id,
      postId: post.id,
      userEngagementField: 'favoritedPosts',
      updatedUserEngagementArray: updatedFavoritedPosts,
      postCountField: 'favoritesCount',
      delta: newFavoritedState ? 1 : -1,
    })

    if (userUpdateOk) {
      await refreshUser()
    }

    if (!userUpdateOk || !postUpdateOk) {
      console.error('Favorite toggle failed, rolling back UI.')
      setIsFavorited(currentlyFavorited)
      setCurrentFavoriteCount((prevCount) =>
        Math.max(0, newFavoritedState ? prevCount - 1 : prevCount + 1),
      )
      if (userUpdateOk && !postUpdateOk) {
        await refreshUser()
      }
    }
    setIsUpdatingFavorite(false)
  }

  const handleToggleLike = async () => {
    if (!currentUser) {
      router.push('/login?redirect_to=' + encodeURIComponent(window.location.pathname))
      return
    }
    if (isUpdatingLike) return

    setIsUpdatingLike(true)
    const currentlyLiked = isLiked
    const newLikedState = !currentlyLiked
    setCurrentLikeCount((prevCount) => Math.max(0, newLikedState ? prevCount + 1 : prevCount - 1))
    setIsLiked(newLikedState)

    const originalLikedPosts =
      currentUser.likedPosts?.map((p) => (typeof p === 'string' ? p : p.id)) || []
    let updatedLikedPosts: string[]

    if (currentlyLiked) {
      updatedLikedPosts = originalLikedPosts.filter((id) => id !== post.id)
    } else {
      updatedLikedPosts = [...originalLikedPosts, post.id]
    }

    const { userUpdateOk, postUpdateOk } = await updateUserAndPostEngagement({
      userId: currentUser.id,
      postId: post.id,
      userEngagementField: 'likedPosts',
      updatedUserEngagementArray: updatedLikedPosts,
      postCountField: 'likes',
      delta: newLikedState ? 1 : -1,
    })

    if (userUpdateOk) {
      await refreshUser()
    }

    if (!userUpdateOk || !postUpdateOk) {
      console.error('Like toggle failed, rolling back UI.')
      setIsLiked(currentlyLiked)
      setCurrentLikeCount((prevCount) => Math.max(0, newLikedState ? prevCount - 1 : prevCount + 1))
      if (userUpdateOk && !postUpdateOk) {
        await refreshUser()
      }
    }
    setIsUpdatingLike(false)
  }

  return (
    <>
      {/* Engagement Section */}
      <div className="flex flex-wrap items-center justify-between gap-y-4 mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            className="flex items-center cursor-pointer gap-2 px-3 sm:px-4 py-2 bg-white rounded-full shadow-sm hover:shadow transition-all border border-gray-200 disabled:opacity-50"
            onClick={handleToggleLike}
            disabled={isUpdatingLike || isLoadingUser}
          >
            {isUpdatingLike ? (
              <Loader2 className="h-4 w-4 text-[#b01c14] animate-spin" />
            ) : (
              <ThumbsUp
                className={`h-4 w-4 ${isLiked ? 'text-blue-500 fill-blue-500' : 'text-[#b01c14]'}`}
              />
            )}
            <span className="text-sm font-medium">
              {isLiked ? 'La jeclaaday' : 'Jeclow'} ({currentLikeCount})
            </span>
          </button>
          <button
            className="flex items-center cursor-pointer gap-2 px-3 sm:px-4 py-2 bg-white rounded-full shadow-sm hover:shadow transition-all border border-gray-200 disabled:opacity-50"
            onClick={handleToggleFavorite}
            disabled={isUpdatingFavorite || isLoadingUser}
          >
            {isUpdatingFavorite ? (
              <Loader2 className="h-4 w-4 text-[#b01c14] animate-spin" />
            ) : (
              <Bookmark
                className={`h-4 w-4 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-[#b01c14]'}`}
              />
            )}
            <span className="text-sm font-medium">
              {isFavorited ? 'La kaydiyey' : 'Kaydi'} ({currentFavoriteCount})
            </span>
          </button>

          <div className="flex items-center">
            <SharePopoverClient
              title={post.name}
              url={currentUrl}
              buttonVariant="outline"
              buttonSize="default"
              showLabel={true}
              className="bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all border border-gray-200"
            />
          </div>
        </div>
      </div>
    </>
  )
}
