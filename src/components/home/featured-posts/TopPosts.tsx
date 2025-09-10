import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/payload-types'
import { ArrowRight, Clock } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import { getPostImageFromLayout, getPostExcerpt, getPostAuthorDisplayName } from '@/utils/postUtils'
import { formatTimeAgo } from '@/utils/dateUtils'

interface TopPostsProps {
  posts: BlogPost[]
}

export const TopPosts: React.FC<TopPostsProps> = ({ posts }) => {
  if (!posts || posts.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
      {posts.map((post) => {
        const imageUrl = getPostImageFromLayout(post.layout)
        const excerpt = getPostExcerpt(post, { maxLength: 100, prioritizeCoverSubheading: false })
        const authorName = getPostAuthorDisplayName(post)

        return (
          <Card
            key={post.id}
            className="group overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] p-0 gap-0"
          >
            <Link
              href={`/news/${post.slug}`}
              className="block h-full"
              aria-label={`Read article: ${post.name}`}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={post.name}
                    fill
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs sm:text-sm">Sawir ma jiro</span>
                  </div>
                )}
              </div>
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-center text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 gap-2 sm:gap-3 flex-wrap">
                  <span className="flex items-center">
                    <Clock className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {formatTimeAgo(post.createdAt)}
                  </span>
                  {typeof post.author === 'object' && post.author && (
                    <span className="flex items-center">
                      <span className="inline-block w-1 h-1 rounded-full bg-gray-300 mr-2"></span>
                      {authorName}
                    </span>
                  )}
                </div>
                <h3 className="font-sans text-base sm:text-lg font-bold leading-tight line-clamp-2 mb-2 sm:mb-3 text-gray-800 group-hover:text-[#b01c14] transition-colors">
                  {post.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4">
                  {excerpt}
                </p>
                <div className="flex items-center text-[#b01c14] group-hover:text-[#b01c14]/80">
                  <span className="text-xs sm:text-sm">Akhri dheeraad</span>
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Link>
          </Card>
        )
      })}
    </div>
  )
}
