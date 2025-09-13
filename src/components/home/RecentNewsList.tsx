import React from 'react'
import { BlogPost } from '@/payload-types'
import { Newspaper } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { RecentNewsItem } from './RecentNewsItem'
import { getPostImageFromLayout } from '@/utils/postUtils'

interface RecentNewsListProps {
  posts: BlogPost[]
  postsToShow: number
}

export const RecentNewsList: React.FC<RecentNewsListProps> = ({ posts, postsToShow }) => {
  return (
    <Card className="h-full border-0 shadow-md py-4">
      <div
        className="sticky top-0 flex pb-4 items-center justify-between gap-2 border-b border-gray-100 bg-white px-2 sm:px-3 py-0 z-10"
        style={{ borderColor: '#b01c14' }}
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <Newspaper className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#b01c14' }} />
          <h2 className="font-sans text-base sm:text-xl font-bold text-gray-900">
            Wararkii Ugu Dambeeyay
          </h2>
        </div>
        <div className="text-[10px] sm:text-xs text-[#b01c14] font-medium">
          {postsToShow} maqaallo
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {Array.from({ length: postsToShow }).map((_, index) => {
          const post = posts[index % Math.max(1, posts.length)]
          if (!post) return null

          const imageUrl = getPostImageFromLayout(post.layout)

          return <RecentNewsItem key={`${post.id}-${index}`} post={post} imageUrl={imageUrl} />
        })}
      </div>
    </Card>
  )
}
