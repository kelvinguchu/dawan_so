import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VideoHero } from '@/components/videos/VideoHero'
import { VideoRecommendations } from '@/components/videos/VideoRecommendations'
import { getVideoById, getVideos } from '@/lib/video-actions'
import siteConfig, { sharedMetadata } from '@/app/shared-metadata'

interface WatchDetailPageProps {
  readonly params: Promise<{ readonly id: string }>
}

export async function generateMetadata({ params }: WatchDetailPageProps): Promise<Metadata> {
  const { id } = await params
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
      url: new URL(`/videos/${video.id}`, siteConfig.url).toString(),
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
  const { id } = await params
  const video = await getVideoById(id)

  if (!video) {
    notFound()
  }
  const recommendationsResponse = await getVideos({ limit: 12 })
  const recommendations = recommendationsResponse.docs
    .filter((item) => item.id !== video.id)
    .slice(0, 10)

  return (
    <main className="min-h-screen bg-white pb-10">
      <div className="mx-auto max-w-[1800px] sm:px-6 sm:pt-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            <VideoHero video={video} />
          </div>
          <div className="w-full px-4 sm:px-0">
            <VideoRecommendations videos={recommendations} />
          </div>
        </div>
      </div>
    </main>
  )
}
