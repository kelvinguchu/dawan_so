'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/payload-types'
import { ArticleHeader } from './ArticleHeader'
import { ArticleInteractions } from './ArticleInteractions'
import { RelatedArticles } from './RelatedArticles'
import { ArticleBodyContent } from './ArticleBodyContent'
import { BackToTopButton } from './BackToTopButton'
import { AdUnit } from '@/components/ads/AdUnit'
import { trackPageView } from '@/lib/analytics'
import { getRelatedPostsForView } from '@/utils/relatedPostsApi'
import { getPostAuthorName, getPostAuthorRole, getReporterUrl } from '@/utils/postUtils'
import type { BlockType } from './blockrender/BlockUtils'
import { Loader2, UserCircle } from 'lucide-react'
import { AudioTrigger } from '@/components/audio/AudioTrigger'
import { AudioTrack } from '@/contexts/AudioPlayerContext'

interface ArticleProps {
  post: BlogPost
  relatedPosts?: BlogPost[]
}

const resolveBrowserWindow = (): Window | undefined => {
  if (typeof globalThis !== 'object' || !globalThis) {
    return undefined
  }

  if ('window' in globalThis) {
    return (globalThis as typeof globalThis & { window?: Window }).window
  }

  return undefined
}

const hasValidCategoryId = (value: string | undefined | null): value is string => {
  return typeof value === 'string' && value.length > 0
}

type ArticleAudioField = BlogPost['articleAudio']

interface ArticleAudioData {
  url: string
  title: string
  description?: string | null
  filesize?: number | null
  id?: string | number | null
}

const resolveArticleAudio = (audio: ArticleAudioField): ArticleAudioData | null => {
  if (!audio || typeof audio === 'string') {
    return null
  }

  const sourceUrl = audio.url
  if (!sourceUrl) {
    return null
  }

  return {
    url: sourceUrl,
    title: audio.title || audio.filename || 'Dhageyso maqaalka',
    description: audio.description ?? null,
    filesize: audio.filesize ?? null,
    id: audio.id ?? null,
  }
}

export const Article: React.FC<ArticleProps> = ({
  post,
  relatedPosts: initialRelatedPosts = [],
}) => {
  const [currentUrl, setCurrentUrl] = useState('')
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>(initialRelatedPosts)
  const [isLoadingRelated, setIsLoadingRelated] = useState(initialRelatedPosts.length === 0)
  const lastTrackedPostId = useRef<string | null>(null)

  const categorySignature = useMemo(() => {
    if (!post.categories || post.categories.length === 0) {
      return 'none'
    }

    return post.categories
      .map((category) => (typeof category === 'string' ? category : category.id))
      .filter(hasValidCategoryId)
      .join(',')
  }, [post.categories])

  useEffect(() => {
    const browserWindow = resolveBrowserWindow()
    if (browserWindow) {
      setCurrentUrl(browserWindow.location.href)
    }
  }, [])

  useEffect(() => {
    if (!post?.id || lastTrackedPostId.current === post.id) {
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        const userAgent = resolveBrowserWindow()?.navigator.userAgent
        const result = await trackPageView(post.id, userAgent)

        if (result.success) {
          lastTrackedPostId.current = post.id
        } else {
          console.warn('Failed to track page view:', result.error)
        }
      } catch (error) {
        console.error('Error tracking page view:', error)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [post?.id])

  useEffect(() => {
    if (initialRelatedPosts.length > 0) {
      setRelatedPosts(initialRelatedPosts)
      setIsLoadingRelated(false)
    }
  }, [initialRelatedPosts])

  useEffect(() => {
    if (initialRelatedPosts.length > 0) {
      return
    }

    let isMounted = true
    const fetchRelated = async () => {
      setIsLoadingRelated(true)
      try {
        const fetchedPosts = await getRelatedPostsForView({
          currentPostId: post.id,
          currentPostCategories: post.categories,
        })

        if (isMounted) {
          setRelatedPosts(fetchedPosts)
        }
      } catch (error) {
        console.error('Error fetching related posts:', error)
        if (isMounted) {
          setRelatedPosts([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingRelated(false)
        }
      }
    }

    fetchRelated()

    return () => {
      isMounted = false
    }
  }, [initialRelatedPosts.length, post.categories, post.id, categorySignature])

  const layoutBlocks: BlockType[] = Array.isArray(post.layout) ? (post.layout as BlockType[]) : []
  const firstBlockIsCover = Boolean(
    layoutBlocks.length > 0 && layoutBlocks[0].blockType?.toLowerCase() === 'cover',
  )

  const filteredRelated = useMemo(() => {
    const seen = new Set<string>([post.id])
    const deduped: BlogPost[] = []

    for (const candidate of relatedPosts) {
      if (!candidate?.id) {
        continue
      }

      if (seen.has(candidate.id)) {
        continue
      }

      seen.add(candidate.id)
      deduped.push(candidate)
    }

    return deduped
  }, [post.id, relatedPosts])

  const midRecommendations = filteredRelated.slice(0, 2)
  const endRecommendations = filteredRelated.slice(2, 4)

  const usedRecommendationIds = useMemo(() => {
    return new Set(
      [...midRecommendations, ...endRecommendations]
        .map((item) => (item?.id ? String(item.id) : null))
        .filter(Boolean) as string[],
    )
  }, [midRecommendations, endRecommendations])

  const relatedArticlePool = useMemo(() => {
    return filteredRelated.filter((candidate) => {
      if (!candidate?.id) {
        return false
      }

      return !usedRecommendationIds.has(String(candidate.id))
    })
  }, [filteredRelated, usedRecommendationIds])

  const articleAudio = resolveArticleAudio(post.articleAudio)

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-2 hidden xl:block">
          <div className="sticky top-40 w-full">
            <AdUnit slotId="1626998043" className="min-h-[600px] w-full" />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <div className="bg-white min-h-screen">
            <ArticleHeader post={post} currentUrl={currentUrl} />

            <article className="relative">
              <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 relative">
                <div className="max-w-3xl mx-auto bg-white rounded-t-2xl -mt-2 sm:-mt-10 pt-6 sm:pt-10 pb-8 sm:pb-16 px-4 sm:px-8 md:px-12 shadow-sm relative z-10">
                  <AuthorMeta post={post} articleAudio={articleAudio} />

                  <ArticleBodyContent
                    post={post}
                    firstBlockIsCover={firstBlockIsCover}
                    midRecommendations={midRecommendations}
                    endRecommendations={endRecommendations}
                  />
                </div>
              </div>

              <div className="bg-gray-50 py-6 sm:py-8 md:py-12 mt-6 sm:mt-8 border-t border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-3xl mx-auto">
                    <ArticleInteractions post={post} currentUrl={currentUrl} />

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-8">
                      <Link
                        href="/news"
                        className="px-6 py-3 bg-[#b01c14] hover:bg-[#b01c14]/80 transition-colors text-white font-medium rounded-lg text-center sm:text-left"
                      >
                        Maqaallo Dheeraad ah
                      </Link>
                      <BackToTopButton className="px-6 py-3 bg-white hover:bg-gray-50 transition-colors text-[#b01c14] font-medium border border-gray-200 rounded-lg text-center sm:text-left">
                        Ku Noqo Kor
                      </BackToTopButton>
                    </div>

                    {(() => {
                      if (isLoadingRelated) {
                        return (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-[#b01c14] animate-spin" />
                          </div>
                        )
                      }

                      if (relatedArticlePool.length > 0) {
                        return (
                          <RelatedArticles posts={relatedArticlePool} currentPostId={post.id} />
                        )
                      }

                      return null
                    })()}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div className="col-span-2 hidden xl:block">
          <div className="sticky top-40 w-full">
            <AdUnit slotId="1626998043" className="min-h-[600px] w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

const AuthorMeta: React.FC<{ post: BlogPost; articleAudio: ArticleAudioData | null }> = ({
  post,
  articleAudio,
}) => {
  const authorName = getPostAuthorName(post)
  const authorRole = getPostAuthorRole(post)
  const reporterUrl = getReporterUrl(post)

  let profilePictureUrl: string | null = null
  try {
    if (post.author && typeof post.author === 'object') {
      const author = post.author as { profilePicture?: { url?: string } | string }
      if (author.profilePicture && typeof author.profilePicture === 'object') {
        profilePictureUrl = author.profilePicture.url ?? null
      }
    }
  } catch (error) {
    console.error('Error resolving profile picture:', error)
  }

  const audioTrack: AudioTrack | undefined = useMemo(() => {
    if (!articleAudio) {
      return undefined
    }

    const title = post.name || articleAudio.title || 'Dhageyso maqaalka'

    return {
      id: articleAudio.id ? String(articleAudio.id) : `article-${post.id}`,
      title,
      artist: authorName,
      src: articleAudio.url,
      articleSlug: post.slug ?? undefined,
    }
  }, [articleAudio, authorName, post.id, post.slug, post.name])

  return (
    <div className="mb-6 sm:mb-8 pb-6 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {audioTrack ? (
          <div className="order-2 sm:order-1">
            <AudioTrigger track={audioTrack} size="sm" className="px-3 py-2" />
          </div>
        ) : null}

        <div className="flex items-start gap-3 flex-1 order-1 sm:order-2">
          <div className="flex-shrink-0">
            {profilePictureUrl ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={profilePictureUrl}
                  alt={`${authorName} profile picture`}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <UserCircle className="h-6 w-6 text-[#b01c14]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-900 text-sm sm:text-base leading-relaxed break-words">
              Waxaa qoray{' '}
              <Link
                href={reporterUrl}
                className="text-[#b01c14] hover:text-[#b01c14]/80 transition-colors underline decoration-1 underline-offset-2"
              >
                {authorName}
              </Link>{' '}
              - {authorRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
