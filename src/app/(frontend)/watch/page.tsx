import React from 'react'
import type { Metadata } from 'next'
import { VideoSearchBar } from '@/components/watch/VideoSearchBar'
import { VideoCard } from '@/components/watch/VideoCard'
import { getVideos } from '@/lib/video-actions'
import siteConfig, { sharedMetadata } from '@/app/shared-metadata'

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Daawo',
  description: 'Daawo fiidiyowyada cusub ee warbixinno, wareysiyo, iyo falanqayn qoto dheer.',
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Daawo',
    description: 'Daawo fiidiyowyada cusub ee warbixinno, wareysiyo, iyo falanqayn qoto dheer.',
    url: new URL('/watch', siteConfig.url).toString(),
    type: 'website',
  },
  alternates: {
    canonical: new URL('/watch', siteConfig.url).toString(),
  },
}

export const revalidate = 60

interface WatchPageProps {
  searchParams?: Promise<{
    search?: string
  }>
}

export default async function WatchPage({ searchParams }: Readonly<WatchPageProps>) {
  const resolvedParams = searchParams ? await searchParams : {}
  const searchTerm = resolvedParams.search ?? ''

  const videos = await getVideos({ searchTerm, limit: 24 })

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="container mx-auto px-4 pt-6">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-6 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daawo</h1>
            <p className="text-sm text-gray-500">
              Warbixinno muuqaal ah, wareysiyo, iyo sheekooyin ka imanaya gudaha Soomaaliya.
            </p>
          </div>
          <div className="w-full max-w-lg">
            <VideoSearchBar defaultValue={searchTerm} />
          </div>
        </div>

        {videos.docs.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-gray-200 bg-white/80 p-12 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-900">Weli fiidiyowyo ma jiraan</p>
            <p className="mt-2 text-sm text-gray-500">
              Isku day erey kale oo raadis ah ama ku soo laabo goor dhow.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {videos.docs.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
