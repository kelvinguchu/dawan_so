import React from 'react'
import Link from 'next/link'
import { BiTime } from 'react-icons/bi'
import { getFooterData } from '@/lib/footer-utils'
import type { BlogPost, Media } from '@/payload-types'
import Image from 'next/image'

function getPostImage(post: BlogPost): string | null {
  if (!post.layout) return null

  for (const block of post.layout) {
    if (block.blockType === 'cover' && block.image) {
      const media = typeof block.image === 'string' ? null : (block.image as Media)
      return media?.url || null
    }
  }

  for (const block of post.layout) {
    if (block.blockType === 'image' && block.image) {
      const media = typeof block.image === 'string' ? null : (block.image as Media)
      return media?.url || null
    }
  }

  return null
}

function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

export async function FooterRecentPosts() {
  const { recentPosts } = await getFooterData()

  return (
    <div className="hidden sm:block sm:col-span-2 lg:col-span-4">
      <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white relative pb-2 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-10 sm:before:w-12 before:h-0.5 before:bg-[#b01c14]">
        Qoraallo Cusub
      </h4>

      {recentPosts.map((post) => (
        <Link
          key={post.id}
          href={`/news/${post.slug}`}
          className="flex items-center mb-4 sm:mb-6 group hover:bg-slate-800/30 -mx-2 px-2 py-2 rounded transition-colors"
          aria-label={`Akhri maqaalka: ${post.name}`}
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden flex-shrink-0 mr-2 sm:mr-3">
            {getPostImage(post) ? (
              <div className="relative w-full h-full">
                <Image
                  src={getPostImage(post) || ''}
                  alt={post.name}
                  fill
                  sizes="(max-width: 640px) 96px, 128px"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="bg-slate-800 w-full h-full flex items-center justify-center">
                <span className="text-[#b01c14] text-[10px] sm:text-xs">Sawir ma jiro</span>
              </div>
            )}
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-medium text-white group-hover:text-[#b01c14] transition-colors line-clamp-2">
              {post.name}
            </h5>
            <div className="flex items-center mt-1 text-[10px] sm:text-xs text-slate-400">
              <BiTime className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
              {formatDate(post.createdAt)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
