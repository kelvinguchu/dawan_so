import React from 'react'
import Image from 'next/image'
import { BlogPost } from '@/payload-types'
import { format } from 'date-fns'
import { CalendarDays, Clock } from 'lucide-react'

import { getPostImageFromLayout } from '@/utils/postUtils'

interface ArticleHeaderProps {
  post: BlogPost
  currentUrl: string
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({ post, currentUrl }) => {
  const publishedDate = format(new Date(post.createdAt), 'MMMM d, yyyy')
  const wordCount =
    post.layout?.reduce((acc, block) => {
      if (block.blockType === 'richtext' && block.content?.root?.children) {
        return (
          acc +
          block.content.root.children
            .map(
              (child: {
                type: string
                version: number
                children?: { text?: string }[]
                [k: string]: unknown
              }) => {
                const children = child.children ?? []
                const text = children
                  .map((span: { text?: string }) => span.text || '')
                  .join(' ')
                  .trim()

                if (!text) return 0

                return text.split(/\s+/).filter((word) => word.length > 0).length
              },
            )
            .reduce((sum: number, count: number) => sum + count, 0)
        )
      }
      return acc
    }, 0) ??
    post.name
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  const readingTime = Math.ceil(wordCount / 200)

  const coverImageUrl = getPostImageFromLayout(post.layout, 'tablet')

  return (
    <header>
      <div className="relative">
        {coverImageUrl ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-transparent z-10" />
            <div className="w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] relative bg-gray-900">
              <Image
                src={coverImageUrl}
                alt={post.name}
                fill
                className="object-contain"
                priority
                quality={85}
                sizes="100vw"
              />
            </div>
          </>
        ) : (
          <div className="w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-800 z-0"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cg%20fill-opacity%3D%220.05%22%3E%3Ccircle%20fill%3D%22%23fff%22%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] bg-[length:24px_24px] opacity-20 z-5"></div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 md:p-8 lg:p-16 text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold mb-3 sm:mb-6 leading-tight text-shadow break-words hyphens-auto">
              {post.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-2 sm:gap-y-3 text-white/90 text-xs sm:text-sm md:text-base">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1.5 sm:mr-2 md:mr-3 text-white" />
                <span>{publishedDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1.5 sm:mr-2 md:mr-3 text-white" />
                <span>{readingTime} daqiiqo akhris</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
