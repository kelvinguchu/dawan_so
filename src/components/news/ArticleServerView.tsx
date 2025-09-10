'use client'

import React from 'react'
import { BlogPost } from '@/payload-types'
import { BlockRenderer } from './BlockRenderer'
import { ArticleHeader } from './ArticleHeader'
import { RelatedArticles } from './RelatedArticles'
import { ArticleInteractions } from './ArticleInteractions'
import { BackToTopButton } from './BackToTopButton'
import Link from 'next/link'
import Image from 'next/image'
import { UserCircle } from 'lucide-react'
import { getPostAuthorName, getPostAuthorRole, getReporterUrl } from '@/utils/postUtils'
import type { BlockType } from './blockrender/BlockUtils'
import { InArticleAd } from '@/components/ads/InArticleAd'

interface ArticleServerViewProps {
  post: BlogPost
  relatedPosts: BlogPost[]
  currentUrl: string
}

export const ArticleServerView: React.FC<ArticleServerViewProps> = ({
  post,
  relatedPosts,
  currentUrl,
}) => {
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 order-1 sm:order-2">
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
                            <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden">
                              <Image
                                src={profilePictureUrl}
                                alt={`${getPostAuthorName(post)} profile picture`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 24px, 28px"
                              />
                            </div>
                          )
                        }
                      } catch (error) {
                        console.log('Error rendering profile picture:', error)
                      }

                      return <UserCircle className="h-6 w-6 sm:h-7 sm:w-7 text-[#b01c14]" />
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900 text-sm sm:text-base leading-relaxed break-words">
                      Waxaa qoray{' '}
                      <Link
                        href={getReporterUrl(post)}
                        className="text-[#b01c14] hover:text-[#238ca3] transition-colors underline decoration-1 underline-offset-2"
                      >
                        {getPostAuthorName(post)}
                      </Link>{' '}
                      - {getPostAuthorRole(post)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {post.layout && post.layout.length > 0 ? (
              (post.layout ?? []).map((block, i) => {
                const isMidPoint = i === Math.floor((post.layout ?? []).length / 2)

                if (i === 0) {
                  const blockType = block.blockType?.toLowerCase()
                  if (blockType === 'cover' || blockType === 'image') {
                    return null
                  }
                }

                const hideCoverBlockTextOverlay = i === 0 && firstBlockIsCover

                const blockComponent = (
                  <BlockRenderer
                    key={`${block.blockType}-${i}-${post.id}`}
                    block={block as unknown as BlockType}
                    hideTextOverlay={hideCoverBlockTextOverlay}
                  />
                )

                if (isMidPoint) {
                  return (
                    <React.Fragment key={`block-ad-${i}`}>
                      {blockComponent}
                      <InArticleAd />
                    </React.Fragment>
                  )
                }

                return blockComponent
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
              <ArticleInteractions post={post} currentUrl={currentUrl} />

              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-8">
                <Link
                  href="/news"
                  className="px-6 py-3 bg-[#b01c14] hover:bg-[#238ca3] transition-colors text-white font-medium rounded-lg text-center sm:text-left"
                >
                  Maqaallo Dheeraad ah
                </Link>
                <BackToTopButton className="px-6 py-3 bg-white hover:bg-gray-50 transition-colors text-[#b01c14] font-medium border border-gray-200 rounded-lg text-center sm:text-left">
                  Ku Noqo Kor
                </BackToTopButton>
              </div>

              {relatedPosts && relatedPosts.length > 0 && (
                <RelatedArticles posts={relatedPosts} currentPostId={post.id} />
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
