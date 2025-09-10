import React from 'react'
import Link from 'next/link'
import { BlogCategory, BlogPost } from '@/payload-types'
import {
  Building2,
  CircleDollarSign,
  Globe,
  Palette,
  Smartphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import Image from 'next/image'

import { getPostImageFromLayout } from '@/utils/postUtils'

interface CategorySectionProps {
  categoriesWithPosts: (BlogCategory & { latestPost?: BlogPost })[]
}

export const CategorySection: React.FC<CategorySectionProps> = ({ categoriesWithPosts }) => {
  const categoryStyles = [
    {
      icon: <Building2 className="h-8 w-8" />,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: <CircleDollarSign className="h-8 w-8" />,
      gradient: 'from-[#b01c14] to-[#218ba0]',
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: <Globe className="h-8 w-8" />,
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      icon: <Palette className="h-8 w-8" />,
      gradient: 'from-pink-500 to-pink-600',
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      gradient: 'from-[#b01c14] to-[#218ba0]',
    },
  ]

  if (categoriesWithPosts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Qaybo leh qoraallo lama helin.</p>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesWithPosts.map((category, index) => {
          const style = categoryStyles[index % categoryStyles.length]
          const post = category.latestPost
          const imageUrl = post ? getPostImageFromLayout(post.layout) : null

          return (
            <div
              key={category.id}
              className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              {/* Category header - links to category page */}
              <Link href={`/categories/${category.slug}`} className="block">
                <div className="relative h-48 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      fill
                      className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`h-full w-full bg-gradient-to-r ${style.gradient} flex items-center justify-center p-6`}
                    >
                      <div className="text-white">{style.icon}</div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <div className={`text-white font-sans font-bold text-2xl`}>{category.name}</div>
                  </div>
                </div>
              </Link>

              <div className="p-4 border-t border-gray-100">
                {post ? (
                  <>
                    {/* Article preview - links to individual article */}
                    <Link
                      href={`/news/${post.slug}`}
                      className="block group/article hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors"
                      aria-label={`Akhri maqaalka: ${post.name}`}
                    >
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover/article:text-[#b01c14] transition-colors mb-2">
                          {post.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </Link>

                    {/* Category browse link */}
                    <Link href={`/categories/${category.slug}`} className="block">
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center hover:text-[#b01c14]/80 transition-colors">
                        <span className="text-sm font-medium text-[#b01c14]">Ka daalaco maqaallada</span>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-[#b01c14]" />
                        </div>
                      </div>
                    </Link>
                  </>
                ) : (
                  <Link href={`/categories/${category.slug}`} className="block">
                    <p className="text-sm text-gray-600 mb-3">
                      Ka baadh maqaalladii ugu dambeeyay ee {category.name.toLowerCase()}
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center hover:text-[#b01c14]/80 transition-colors">
                      <span className="text-sm font-medium text-[#b01c14]">Ka daalaco maqaallada</span>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-[#b01c14]" />
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
