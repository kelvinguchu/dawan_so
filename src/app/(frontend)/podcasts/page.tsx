import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { PodcastList } from '@/components/podcasts/PodcastList'
import { Skeleton } from '@/components/ui/skeleton'
import { sharedMetadata } from '@/app/shared-metadata'
import siteConfig from '@/app/shared-metadata'
import ErrorFallback from '@/components/ErrorFallback'
import { getPodcasts } from '@/lib/podcast-actions'

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Podkaastyada | Dawan TV - Codad iyo Sheekooyin Soomaaliyeed',
  description:
    'Dhageyso podkaasyo xiiso leh oo ka kooban codad iyo sheekooyin Soomaaliyeed. dooddo qoto dheer oo ku saabsan siyaasadda, dhaqanka, ganacsiga iyo arrimaha hadda socda ee Soomaaliya.',
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Podkaastyada | Dawan TV - Codad iyo Sheekooyin Soomaaliyeed',
    description:
      'Podkaasyo xiiso leh oo diiradda saaraya codadka iyo sheekooyinka Soomaaliyeed — dooddo ku saabsan siyaasadda, dhaqanka, ganacsiga iyo arrimaha gudaha Soomaaliya.',
    url: new URL('/podcasts', siteConfig.url).toString(),
    type: 'website',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Dawan TV - Podkaastyada iyo Sheekooyin Maqal Soomaaliyeed',
      },
    ],
  },
  twitter: {
    ...sharedMetadata.twitter,
    title: 'Podkaastyada | Dawan TV - Codad iyo Sheekooyin Soomaaliyeed',
    description:
      'Dhageyso podkaasyo Soomaaliyeed oo ka hadlaya siyaasadda, dhaqanka, ganacsiga iyo arrimaha maxalliga ah ee Soomaaliya.',
    images: ['/og-default.png'],
  },
  keywords: [
    'Somali podcasts',
    'Podkaastyada Soomaaliyeed',
    'Soomaaliya',
    'Wararka Soomaaliya',
    'Siyaasadda Soomaaliya',
    'Dhaqanka Soomaaliyeed',
    'Ganacsiga Soomaaliya',
    'Codadka Soomaaliyeed',
    'Sheekooyinka Soomaaliyeed',
    'Dawan TV',
    'Hornafrika',
  ],
  alternates: {
    canonical: new URL('/podcasts', siteConfig.url).toString(),
  },
}

export const revalidate = 60

interface PodcastsPageProps {
  searchParams?: Promise<{
    search?: string
    page?: string
    category?: string
    series?: string
    sort?: string
  }>
}

const PodcastsPageSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:pt-4 md:pb-12 ">
      <div className="mb-6 sm:mb-8 md:mb-10">
        <Skeleton className="h-8 w-48 mb-2 rounded" />
        <Skeleton className="h-5 w-96 rounded" />
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
        </div>
        <Skeleton className="h-10 w-full rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function PodcastsPage({ searchParams }: Readonly<PodcastsPageProps>) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const page = parseInt(resolvedSearchParams.page ?? '1', 10)
  const searchTerm = resolvedSearchParams.search ?? ''
  const category = resolvedSearchParams.category ?? 'all'
  const series = resolvedSearchParams.series ?? 'all'
  const sortBy = resolvedSearchParams.sort ?? 'newest'

  try {
    const podcastsData = await getPodcasts({
      page,
      limit: 20,
      searchTerm,
      category,
      series,
      sortBy,
    })

    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-2 md:py-4">
          <Suspense fallback={<PodcastsPageSkeleton />}>
            <PodcastList
              podcasts={podcastsData.docs}
              title="Podkaastyada"
              showFilters={true}
              showSearch={true}
              className="w-full"
            />
          </Suspense>

          {podcastsData.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <p className="text-sm text-gray-600">
                Bogga {podcastsData.page} ee {podcastsData.totalPages} • {podcastsData.totalDocs} qaybood guud
              </p>
            </div>
          )}
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error loading podcasts:', error)

    return (
      <main className="bg-gray-50 min-h-screen">
        <ErrorFallback
          title="Podkaastyada lama heli karo"
          message="Waxaan dhibaato ku qabnaa soo raridda waxyaabaha podkaasta. Fadlan mar dambe isku day."
        />
      </main>
    )
  }
}
