import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VideoHero } from '@/components/watch/VideoHero'
import { VideoRecommendations } from '@/components/watch/VideoRecommendations'
import { getVideoById, getVideos } from '@/lib/video-actions'
import siteConfig, { sharedMetadata } from '@/app/shared-metadata'

interface WatchDetailPageProps {
  readonly params: { id: string }
}

export async function generateMetadata({ params }: WatchDetailPageProps): Promise<Metadata> {
  const { id } = params
  const video = await getVideoById(id)

  if (!video) {
    return {
      ...sharedMetadata,
      title: 'Fiidiyow lama helin | Dawan TV',
      robots: { index: false, follow: false },
    }
  }

  const description = video.description ?? 'Daawo fiidiyowyada ugu dambeeyay ee Dawan TV.'

  return {
    ...sharedMetadata,
    title: `${video.title} | Daawo`,
    description,
    openGraph: {
      ...sharedMetadata.openGraph,
      title: `${video.title} | Daawo`,
      description,
      url: new URL(`/watch/${video.id}`, siteConfig.url).toString(),
      type: 'video.other',
      images: video.thumbnailURL
        ? [
            {
              url: video.thumbnailURL,
              width: 1280,
              height: 720,
              alt: video.title,
            },
          ]
        : sharedMetadata.openGraph?.images,
    },
  }
}

export default async function WatchDetailPage({ params }: WatchDetailPageProps) {
  const { id } = params
  const videoData = await getVideoById(id)

  if (!videoData) {
    notFound()
  }

  const video = videoData
  const recommendationsResponse = await getVideos({ limit: 6 })
  const recommendations = recommendationsResponse.docs
    .filter((item) => item.id !== video.id)
    .slice(0, 5)

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="container mx-auto px-4 pt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <VideoHero video={video} />
          <VideoRecommendations videos={recommendations} />
        </div>
      </div>
    </main>
  )
}
