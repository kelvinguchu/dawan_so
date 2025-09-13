'use client'

import React from 'react'
import Link from 'next/link'
import { User as PayloadUser, BlogPost } from '@/payload-types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { BookmarkIcon, ThumbsUp } from 'lucide-react'

interface UserPostsProps {
  user: PayloadUser
}

const isPopulatedPost = (post: string | BlogPost): post is BlogPost => {
  return typeof post === 'object' && post !== null && 'id' in post
}

export const UserPosts: React.FC<UserPostsProps> = ({ user }) => {
  const favoritedPosts = (user.favoritedPosts || []).filter(isPopulatedPost)
  const likedPosts = (user.likedPosts || []).filter(isPopulatedPost)

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="bg-white border border-slate-200 inline-flex h-9 sm:h-10 p-1 mb-3 sm:mb-4 w-full sm:w-auto overflow-x-auto">
          <TabsTrigger
            value="favorites"
            className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-800 rounded-sm h-7 sm:h-8 px-2 sm:px-3 flex-nowrap"
          >
            <BookmarkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap text-xs sm:text-sm">
              Jecel ({favoritedPosts.length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="liked"
            className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-800 rounded-sm h-7 sm:h-8 px-2 sm:px-3 flex-nowrap"
          >
            <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap text-xs sm:text-sm">
              Qoraallo la jeclaaday ({likedPosts.length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-0">
          {favoritedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {favoritedPosts.map((post) => (
                <PostCard key={post.id} post={post} type="favorite" />
              ))}
            </div>
          ) : (
            <EmptyState type="favorites" message="Weli maadan jecleysan wax qoraal ah." />
          )}
        </TabsContent>

        <TabsContent value="liked" className="mt-0">
          {likedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {likedPosts.map((post) => (
                <PostCard key={post.id} post={post} type="liked" />
              ))}
            </div>
          ) : (
            <EmptyState type="likes" message="Weli maadan jeclayn wax qoraal ah." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface PostCardProps {
  post: BlogPost
  type: 'favorite' | 'liked'
}

const PostCard: React.FC<PostCardProps> = ({ post, type }) => {
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString()
    : "Taariikh la'aan"

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <Link href={`/news/${post.slug}`} className="block">
          <div className="flex items-start">
            {type === 'favorite' ? (
              <BookmarkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 mt-0.5 sm:mt-1 mr-2 sm:mr-3 flex-shrink-0" />
            ) : (
              <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 mt-0.5 sm:mt-1 mr-2 sm:mr-3 flex-shrink-0" />
            )}
            <div>
              <h3 className="font-medium text-sm sm:text-base text-slate-800 leading-tight hover:text-[#b01c14]">
                {post.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">{formattedDate}</p>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}

interface EmptyStateProps {
  type: 'favorites' | 'likes'
  message: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, message }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 text-center">
      {type === 'favorites' ? (
        <BookmarkIcon className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300 mx-auto mb-2 sm:mb-3" />
      ) : (
        <ThumbsUp className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300 mx-auto mb-2 sm:mb-3" />
      )}
      <p className="text-sm text-slate-500">{message}</p>
      <div className="mt-3 sm:mt-4">
        <Link href="/news" className="text-xs font-medium text-[#b01c14] hover:text-[#b01c14]/80">
          Ka daalaco maqaallada si aad u {type === 'favorites' ? 'jecleysato' : 'jeclaato'}
        </Link>
      </div>
    </div>
  )
}
