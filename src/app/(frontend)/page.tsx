import React from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedPosts } from '@/components/home/FeaturedPosts'
import { CategorySection } from '@/components/home/CategorySection'
import { NewYearCelebration } from '@/components/home/NewYearCelebration'
// TEMPORARILY DISABLED - Ads removed, may be restored later
// import { HomePageAdSection, HomePageBottomAdSection } from '@/components/home/HomePageAds'
import { Metadata } from 'next'
import siteConfig, { sharedMetadata } from '@/app/shared-metadata'
import { getHomePageData } from '@/lib/homepage-actions'

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Dawan TV - Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya iyo Geeska Afrika',
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Dawan TV - Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya iyo Geeska Afrika',
    description:
      'Discover the latest news, stories, and insights from across Somalia. Your trusted source for African perspectives on politics, culture, business, and more.',
    type: 'website',
    url: siteConfig.url,
    siteName: 'Dawan TV',
  },
  twitter: {
    ...sharedMetadata.twitter,
    title: 'Dawan TV - Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya iyo Geeska Afrika',
    description:
      'Discover the latest news, stories, and insights from across Somalia. Your trusted source for African perspectives on politics, culture, business, and more.',
    site: '@dawanafrica',
  },
  alternates: {
    canonical: new URL('/', siteConfig.url).toString(),
  },
}

export const revalidate = 30

export default async function HomePage() {
  const {
    latestPost,
    heroPosts,
    trendingPosts,
    editorsPicks,
    recentNews,
    categoriesWithPosts,
    flashNews,
  } = await getHomePageData()

  return (
    <div className="min-h-screen">
      <NewYearCelebration />
      <HeroSection latestPost={latestPost} recentPosts={heroPosts} flashNews={flashNews} />

      <FeaturedPosts
        trendingPosts={trendingPosts}
        editorsPicks={editorsPicks}
        recentNewsItems={recentNews}
        heroPosts={heroPosts}
      />

      {/* TEMPORARILY DISABLED - Ads removed, may be restored later */}
      {/* <HomePageAdSection /> */}

      <section className=" bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Qaybaha Wararka</h2>
          <CategorySection categoriesWithPosts={categoriesWithPosts} />
        </div>
      </section>

      {/* TEMPORARILY DISABLED - Ads removed, may be restored later */}
      {/* <HomePageBottomAdSection /> */}
    </div>
  )
}
