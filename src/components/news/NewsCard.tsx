'use client'

import React from 'react'
import Image from 'next/image'
import { BlogPost as ImportedBlogPost } from '@/payload-types'
import { ArrowUpRight, Clock, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getPostImageFromLayout, getPostExcerpt } from '@/utils/postUtils'
import { formatTimeAgo } from '@/utils/dateUtils'
import { ArticlePrefetchLink } from '@/components/common/ArticlePrefetchLink'
import { getReadingTime } from '@/lib/utils'

interface NewsCardProps {
  post: ImportedBlogPost
  showCategories?: boolean
}

export const NewsCard: React.FC<NewsCardProps> = ({ post, showCategories = true }) => {
  const imageUrl = getPostImageFromLayout(post.layout)
  const excerpt = getPostExcerpt(post, { maxLength: 150, prioritizeCoverSubheading: false })
  const timeAgo = formatTimeAgo(post.createdAt)
  const categories = post.categories

  // Calculate reading time from excerpt
  const readingTime = getReadingTime(excerpt || post.name)

  // Get primary category for display
  const primaryCategory =
    categories && categories.length > 0 && typeof categories[0] === 'object'
      ? (categories[0] as { name: string }).name // Type assertion for clarity
      : null

  // Brand color instead of dynamic color
  const brandColor = '#b01c14'

  return (
    <article className="group shadow-md relative flex flex-col h-full overflow-hidden rounded-xl bg-white transition-all duration-500 hover:translate-y-[-4px]">
      <ArticlePrefetchLink
        href={`/news/${post.slug}`}
        slug={post.slug}
        className="block h-full"
        aria-label={`Akhri maqaalka: ${post.name}`}
        data-article-id={post.id}
        data-article-slug={post.slug}
      >
        {/* Card top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-1 z-10 opacity-80 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: brandColor }}
        />

        {/* Main card container with subtle shadow that intensifies on hover */}
        <div className="flex flex-col h-full shadow-sm group-hover:shadow-xl transition-shadow duration-500">
          {/* Image section with gradient overlay */}
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt={post.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </>
            ) : (
              <div
                className="h-full w-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${brandColor}33, ${brandColor}22)`,
                  boxShadow: `inset 0 0 30px ${brandColor}11`,
                }}
              >
                <span className="text-sm font-medium opacity-60" style={{ color: brandColor }}>
                  {primaryCategory ?? 'Maqaal Warar'}
                </span>
              </div>
            )}

            {/* Category pill - positioned in top left */}
            {showCategories && primaryCategory && (
              <div className="absolute top-3 left-3 z-10">
                <div
                  className="px-2.5 py-1 rounded-full text-xs font-medium tracking-wide text-white shadow-md"
                  style={{ backgroundColor: brandColor }}
                >
                  {primaryCategory}
                </div>
              </div>
            )}

            {/* Reading time indicator */}
            <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-xs">
                <BookOpen className="h-3 w-3" />
                <span>{readingTime} daqiiqo akhris</span>
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="flex flex-col flex-grow p-5">
            {/* Article metadata with date only */}
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <span className="flex items-center">
                <Clock className="mr-1 h-3.5 w-3.5 text-gray-400" />
                {timeAgo}
              </span>
            </div>

            {/* Title with simple hover effect */}
            <h3 className="font-sans text-base leading-tight text-gray-900 group-hover:text-[#b01c14] transition-colors">
              {post.name}
            </h3>

            {excerpt && (
              <p className="font-sans text-[15px] text-gray-600 line-clamp-3 mb-2 leading-relaxed">
                {excerpt}
              </p>
            )}

            {/* Spacer to push the footer to the bottom */}
            <div className="flex-grow" />

            {/* Card footer with additional categories and read more link */}
            <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
              {/* Additional categories as subtle badges */}
              <div className="flex flex-wrap gap-1.5">
                {showCategories &&
                  categories &&
                  Array.isArray(categories) &&
                  categories.length > 1 &&
                  categories.slice(1, 3).map((category) =>
                    typeof category === 'object' && category.name ? (
                      <Badge
                        key={category.id}
                        variant="outline"
                        className="text-xs font-normal px-1.5 py-0"
                        style={{ borderColor: `${brandColor}40`, color: brandColor }}
                      >
                        {category.name}
                      </Badge>
                    ) : null,
                  )}
              </div>

              {/* Read more indicator with animated arrow */}
              <div
                className="flex items-center text-sm font-medium transition-colors group-hover:text-slate-900"
                style={{ color: brandColor }}
              >
                <span className="mr-1">Akhri maqaal</span>
                <span className="relative overflow-hidden inline-block w-4 h-4">
                  <ArrowUpRight className="h-4 w-4 absolute transform transition-transform duration-300 group-hover:translate-x-4 group-hover:translate-y-[-4px]" />
                  <ArrowUpRight className="h-4 w-4 absolute transform transition-transform duration-300 translate-x-[-16px] translate-y-[16px] group-hover:translate-x-0 group-hover:translate-y-0" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </ArticlePrefetchLink>
    </article>
  )
}
