import React from 'react'
import { BlogPost } from '@/payload-types'

import { Card, CardContent } from '@/components/ui/card'

import { HeroFeatured } from './HeroFeatured'
import { RecentNewsList } from './RecentNewsList'
import { FlashTicker } from './FlashTicker'

interface HeroSectionProps {
  latestPost: BlogPost | null
  recentPosts: BlogPost[]
}

export const HeroSection: React.FC<HeroSectionProps> = ({ latestPost, recentPosts }) => {
  if (!latestPost && recentPosts.length === 0) {
    return (
      <section className="py-4">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 font-sans">Warka cusub lama heli karo.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (!latestPost) {
    return (
      <section className="py-4">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 font-sans">
                Waqtigan xaadirka ah ma jiro war la iftiimiyay.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  const sidebarPosts = recentPosts.filter((post) => post.id !== latestPost.id).slice(0, 5)

  const POSTS_TO_SHOW = 5

  return (
    <section className="bg-gradient-to-b from-slate-100 to-white py-4 sm:py-6 font-sans">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="group h-full overflow-hidden border-0 p-0 py-0 gap-0 shadow-md sm:shadow-xl transition-all hover:shadow-2xl">
              {recentPosts.length > 0 && (
                <div className="hidden md:block">
                  <FlashTicker posts={recentPosts} />
                </div>
              )}
              <HeroFeatured post={latestPost} />
            </Card>
          </div>

          <div className="md:col-span-1">
            <RecentNewsList posts={sidebarPosts} postsToShow={POSTS_TO_SHOW} />
          </div>
        </div>
      </div>
    </section>
  )
}
