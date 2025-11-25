import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPodcastBySlug, getPodcasts } from '@/lib/podcast-actions'
import siteConfig, { sharedMetadata } from '@/app/shared-metadata'
import { PodcastHero } from '../../../../components/podcasts/PodcastHero'
import { PodcastCard } from '@/components/podcasts/PodcastCard'
import { getPodcastDisplayTitle, getPodcastCoverImage } from '@/utils/podcastUtils'

interface PodcastDetailPageProps {
  readonly params: Promise<{ readonly slug: string }>
}

export async function generateMetadata({ params }: PodcastDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const podcast = await getPodcastBySlug(slug)

  if (!podcast) {
    return {
      ...sharedMetadata,
      title: 'Podcast lama helin | Dawan TV',
      robots: { index: false, follow: false },
    }
  }

  const displayTitle = getPodcastDisplayTitle(podcast)
  const description = podcast.description ?? 'Dhageyso ama daawo podcast-kan Dawan TV.'
  const coverImage = getPodcastCoverImage(podcast)

  return {
    ...sharedMetadata,
    title: `${displayTitle} | Podcasts`,
    description,
    openGraph: {
      ...sharedMetadata.openGraph,
      title: `${displayTitle} | Podcasts`,
      description,
      url: new URL(`/podcasts/${podcast.slug}`, siteConfig.url).toString(),
      type: 'article',
      images: coverImage
        ? [
            {
              url: coverImage,
              width: 1200,
              height: 630,
              alt: displayTitle,
            },
          ]
        : sharedMetadata.openGraph?.images,
    },
  }
}

export default async function PodcastDetailPage({ params }: PodcastDetailPageProps) {
  const { slug } = await params
  const podcast = await getPodcastBySlug(slug)

  if (!podcast) {
    notFound()
  }

  const recommendationsResponse = await getPodcasts({ limit: 10 })
  const recommendations = recommendationsResponse.docs
    .filter((item) => item.id !== podcast.id)
    .slice(0, 10)

  return (
    <main className="min-h-screen bg-white pb-10">
      <div className="mx-auto max-w-[1800px] sm:px-6 sm:pt-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            <PodcastHero podcast={podcast} />
          </div>

          <div className="w-full px-4 sm:px-0">
            {recommendations.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recommendations.map((item) => (
                  <PodcastCard key={item.id} podcast={item} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">Faahfaahin lama hayo weli.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
