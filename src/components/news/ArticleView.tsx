'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { BlogPost as PayloadBlogPost } from '@/payload-types'
import Image from 'next/image'
import { BlockRenderer } from './BlockRenderer'
import { ArticleHeader } from './ArticleHeader'
import { Bookmark, ThumbsUp, Loader2, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RelatedArticles } from './RelatedArticles'
import { updateUserAndPostEngagement } from '@/utils/engagementApi'
import { getRelatedPostsForView } from '@/utils/relatedPostsApi'
import { SharePopover } from './SharePopover'
import { getPostAuthorName, getPostAuthorRole, getReporterUrl } from '@/utils/postUtils'
import type { BlockType } from './blockrender/BlockUtils'
import { useAuth } from '@/contexts/AuthContext'

type BlogPost = PayloadBlogPost

interface ArticleViewProps {
  post: BlogPost
  relatedPosts?: BlogPost[]
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  post,
  relatedPosts: initialRelatedPosts,
}) => {
  const router = useRouter()
  const { user: currentUser, isLoading: isLoadingUser, refreshUser } = useAuth()

  const [isFavorited, setIsFavorited] = useState(false)
  const [currentFavoriteCount, setCurrentFavoriteCount] = useState(0)
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false)

  const [isLiked, setIsLiked] = useState(false)
  const [currentLikeCount, setCurrentLikeCount] = useState(0)
  const [isUpdatingLike, setIsUpdatingLike] = useState(false)

  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>(initialRelatedPosts || [])
  const [isLoadingRelated, setIsLoadingRelated] = useState(!initialRelatedPosts)

  const [currentUrl, setCurrentUrl] = useState<string>('')

  const fetchRelatedPosts = useCallback(async () => {
    if (initialRelatedPosts && initialRelatedPosts.length > 0) {
      return
    }
    setIsLoadingRelated(true)
    try {
      const fetchedPosts = await getRelatedPostsForView({
        currentPostId: post.id,
        currentPostCategories: post.categories,
      })
      setRelatedPosts(fetchedPosts)
    } catch (error) {
      console.error('Error setting related posts in component:', error)
      setRelatedPosts([])
    } finally {
      setIsLoadingRelated(false)
    }
  }, [post.id, post.categories, initialRelatedPosts])

  useEffect(() => {
    if (!initialRelatedPosts || initialRelatedPosts.length === 0) {
      fetchRelatedPosts()
    }
  }, [fetchRelatedPosts, initialRelatedPosts])

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
  }, [currentUser, post.id, post])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
    }
  }, [])

  if (!post) return <div>Maqaal lama helin.</div>

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

  const firstBlockIsCover = !!(
    post.layout &&
    post.layout.length > 0 &&
    post.layout[0].blockType?.toLowerCase() === 'cover'
  )

  return (
    <div className="bg-white min-h-screen">
      <ArticleHeader post={post} currentUrl={currentUrl} />

      <article className="relative">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto bg-white rounded-t-2xl -mt-2 sm:-mt-10 pt-6 sm:pt-10 pb-8 sm:pb-16 px-4 sm:px-8 md:px-12 shadow-sm relative z-10 article-content">
            <div className="mb-6 sm:mb-8 pb-6 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {(() => {
                    try {
                      let profilePictureUrl = null

                      if (post.author && typeof post.author === 'object') {
                        const author = post.author as { profilePicture?: { url?: string } }
                        if (author.profilePicture && typeof author.profilePicture === 'object') {
                          profilePictureUrl = author.profilePicture.url
                        }
                      }

                      if (profilePictureUrl) {
                        return (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src={profilePictureUrl}
                              alt={`${getPostAuthorName(post)} profile picture`}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        )
                      }
                    } catch (error) {
                      console.log('Error rendering profile picture:', error)
                    }

                    return <UserCircle className="h-10 w-10 text-[#b01c14]" />
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 text-sm sm:text-base leading-relaxed break-words">
                    Waxaa qoray{' '}
                    <Link
                      href={getReporterUrl(post)}
                      className="text-[#b01c14] hover:text-[#b01c14]/80 transition-colors underline decoration-1 underline-offset-2"
                    >
                      {getPostAuthorName(post)}
                    </Link>{' '}
                    - {getPostAuthorRole(post)}
                  </span>
                </div>
              </div>
            </div>

            {/* Audio feature disabled */}

            {post.layout && post.layout.length > 0 ? (
              post.layout.map((block, i) => {
                if (i === 0) {
                  const blockType = block.blockType?.toLowerCase()
                  if (blockType === 'cover' || blockType === 'image') {
                    return null
                  }
                }

                const hideCoverBlockTextOverlay = i === 0 && firstBlockIsCover
                return (
                  <BlockRenderer
                    key={`${block.blockType}-${i}-${post.id}`}
                    block={block as unknown as BlockType}
                    hideTextOverlay={hideCoverBlockTextOverlay}
                  />
                )
              })
            ) : (
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800">
                <p>Maqaalkan weli kuma jiraan qaybo nuxur.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 py-6 sm:py-8 md:py-12 mt-6 sm:mt-8 border-t border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-y-4 mb-6 sm:mb-8">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-full shadow-sm hover:shadow transition-all border border-gray-200 disabled:opacity-50"
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
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-full shadow-sm hover:shadow transition-all border border-gray-200 disabled:opacity-50"
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
                    <SharePopover
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

              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-8">
                <Link
                  href="/news"
                  className="px-6 py-3 bg-[#b01c14] hover:bg-[#b01c14]/80 transition-colors text-white font-medium rounded-lg text-center sm:text-left"
                >
                  Maqaallo Dheeraad ah
                </Link>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-6 py-3 bg-white hover:bg-gray-50 transition-colors text-[#b01c14] font-medium border border-gray-200 rounded-lg text-center sm:text-left"
                >
                  Ku Noqo Kor
                </button>
              </div>

              {isLoadingRelated ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 text-[#b01c14] animate-spin" />
                </div>
              ) : relatedPosts && relatedPosts.length > 0 ? (
                <RelatedArticles posts={relatedPosts} currentPostId={post.id} />
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
