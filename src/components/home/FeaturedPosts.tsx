'use client'

import React, { useState } from 'react'
import { BlogPost } from '@/payload-types'

import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp } from 'lucide-react'
import { TopPosts } from './featured-posts/TopPosts'
import { GridPosts } from './featured-posts/GridPosts'
import { ArticleList } from './ArticleList'
import { HeroFeatured } from './HeroFeatured'

interface FeaturedPostsProps {
  trendingPosts: BlogPost[]
  editorsPicks: BlogPost[]
  recentNewsItems: BlogPost[]
  heroPosts: BlogPost[]
}

export const FeaturedPosts: React.FC<FeaturedPostsProps> = ({
  trendingPosts,
  editorsPicks,
  recentNewsItems,
  heroPosts,
}) => {
  const [activeTab, setActiveTab] = useState('trending')

  if (trendingPosts.length === 0 && editorsPicks.length === 0 && recentNewsItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Waqtigan xaadirka ah qoraallo ma jiraan.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tabbedPosts = activeTab === 'trending' ? trendingPosts : editorsPicks
  const topPostsData = tabbedPosts.slice(0, 3)
  const mainFeaturedPostData = tabbedPosts.length > 3 ? tabbedPosts[3] : null
  const gridPostsData = tabbedPosts.slice(4, 6)

  const heroPostIds = heroPosts.slice(0, 6).map((post) => post.id)
  const filteredRecentNews = recentNewsItems.filter(
    (post) => !heroPostIds.includes(post.id),
  )

  return (
    <section className="pt-0 pb-8 sm:pb-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#b01c14]" strokeWidth={2.5} />
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-gray-900">
                Sheekooyin Kale
              </h2>
            </div>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList className="bg-gray-100/80 w-full rounded-full h-9 relative z-10">
                <TabsTrigger
                  value="trending"
                  className="flex-1 sm:flex-none text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#b01c14] rounded-full h-7"
                >
                  Kuwa Ugu Kulul
                </TabsTrigger>
                <TabsTrigger
                  value="editors"
                  className="flex-1 sm:flex-none text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#b01c14] rounded-full h-7"
                >
                  Xulashada Tifaftiraha
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <>
          <TopPosts posts={topPostsData} />

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 mb-8 sm:mb-12 max-w-full">
            <div className="lg:col-span-5">
              {mainFeaturedPostData && <HeroFeatured post={mainFeaturedPostData} />}
            </div>
            <GridPosts posts={gridPostsData} />
          </div>

          <ArticleList posts={filteredRecentNews} />
        </>
      </div>
    </section>
  )
}
