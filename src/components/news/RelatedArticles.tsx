import React from 'react'
import Link from 'next/link'
import { BlogPost } from '@/payload-types'
import Image from 'next/image'
import { Calendar, Tag } from 'lucide-react'

interface RelatedArticlesProps {
  posts: BlogPost[]
  currentPostId?: string
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ posts, currentPostId }) => {
  const getFilteredPosts = () => {
    const filtered = currentPostId ? posts.filter((post) => post.id !== currentPostId) : [...posts]

    const seeded = filtered.map((post, index) => ({
      post,
      sort: parseInt(post.id.slice(-8), 16) + index,
    }))

    seeded.sort((a, b) => a.sort - b.sort)
    const shuffled = seeded.map((item) => item.post)

    return shuffled.slice(0, 6)
  }

  const filteredPosts = getFilteredPosts()

  if (!filteredPosts || filteredPosts.length === 0) {
    return null
  }

  const getPostThumbnail = (post: BlogPost) => {
    if (!post.layout || !Array.isArray(post.layout)) return null

    for (const block of post.layout) {
      if (block.blockType === 'cover' && block.image && typeof block.image !== 'string') {
        return block.image.url
      }
      if (block.blockType === 'image' && block.image && typeof block.image !== 'string') {
        return block.image.url
      }
    }
    return null
  }

  const formatDate = (post: BlogPost) => {
    if (!post.createdAt) return null
    const date = new Date(post.createdAt)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const gridClass =
    filteredPosts.length > 3
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      : filteredPosts.length === 3
        ? 'grid grid-cols-1 md:grid-cols-3 gap-6'
        : 'grid grid-cols-1 md:grid-cols-2 gap-6'

  return (
    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 sm:mb-8">
        Maqaallo La Xidhiidha
      </h2>
      <div className={gridClass}>
        {filteredPosts.map((post) => {
          const thumbnailUrl = getPostThumbnail(post)
          const postDate = formatDate(post)

          return (
            <Link
              key={post.id}
              href={`/news/${post.slug}`}
              className="group flex flex-col h-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#b01c14]/30"
            >
              {thumbnailUrl ? (
                <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={thumbnailUrl}
                    alt={post.name || 'Article thumbnail'}
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-r from-[#b01c14]/80 to-[#b01c14]/80 flex items-center justify-center">
                  <span className="text-[#b01c14] font-medium">Akhri Maqaal</span>
                </div>
              )}

              <div className="flex flex-col flex-grow p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-[#b01c14] transition-colors duration-300 mb-2 line-clamp-2">
                  {post.name}
                </h3>

                <div className="mt-auto pt-4">
                  {postDate && (
                    <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-3">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span>{postDate}</span>
                    </div>
                  )}

                  {post.categories &&
                    Array.isArray(post.categories) &&
                    post.categories.length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
                        <div className="flex flex-wrap gap-1.5">
                          {post.categories.map((category, index) => {
                            const categoryName =
                              typeof category !== 'string' && category.name ? category.name : ''
                            if (!categoryName) return null

                            return (
                              <span
                                key={index}
                                className="inline-block px-2 py-0.5 text-xs bg-[#b01c14]/80 text-[#b01c14] rounded-full"
                              >
                                {categoryName}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="inline-block text-xs sm:text-sm font-medium text-[#b01c14] group-hover:translate-x-1 transition-transform duration-300">
                    Akhri dheeraad →
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
