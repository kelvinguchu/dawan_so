"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { BlogPost } from "@/payload-types"
import { ArrowRight, Calendar } from "lucide-react"
import { formatTimeAgo } from "@/utils/dateUtils"
import { getPostImageFromLayout, getPostExcerpt, getPostAuthorDisplayName } from "@/utils/postUtils"

interface HeroFeaturedProps {
  post: BlogPost
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({ post }) => {
  const imageUrl = getPostImageFromLayout(post.layout)
  const excerpt = getPostExcerpt(post, { maxLength: 180 })
  const authorName = getPostAuthorDisplayName(post)

  return (
    <Link href={`/news/${post.slug}`} className="block h-full" aria-label={`Akhri: ${post.name}`}>
      <div className="relative w-full h-full min-h-[260px] sm:min-h-[340px] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.name}
            fill
            priority
            className="object-cover will-change-transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-200">
            <span className="inline-flex items-center gap-1 bg-white/15 text-white px-2 py-0.5 rounded">
              Featured
            </span>
            <span className="inline-flex items-center text-gray-200">
              <Calendar className="h-3 w-3 mr-1" />
              {formatTimeAgo(post.createdAt)}
            </span>
            {authorName && (
              <span className="hidden sm:inline text-gray-300">
                <span className="mx-2 h-1 w-1 inline-block rounded-full bg-gray-400 align-middle" />
                {authorName}
              </span>
            )}
          </div>
          <h2 className="text-white font-sans font-bold text-xl sm:text-2xl md:text-3xl leading-tight mb-2">
            {post.name}
          </h2>
          {excerpt && (
            <p className="text-gray-200/95 text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl">
              {excerpt}
            </p>
          )}
          <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#b01c14] text-white px-3 py-2 text-xs sm:text-sm">
            Akhri sheekada oo dhan
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default HeroFeatured

