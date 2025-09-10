import React, { Suspense } from 'react'
import { NewsList } from '@/components/news/NewsList'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'
import { sharedMetadata } from '@/app/shared-metadata'
import siteConfig from '@/app/shared-metadata'

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ reporter?: string }>
}): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const reporterName = resolvedSearchParams.reporter

  const baseTitle = 'Warar | Dawan TV - Wararkii Ugu Dambeeyay ee Soomaaliya'
  const baseDescription =
    'La soco wararkii ugu dambeeyay ee Soomaaliya. Daboolid qoto dheer oo ku saabsan siyaasadda, ganacsiga, tiknoolajiyada, dhaqanka iyo in ka badan — oo diiradda saaraya Soomaaliya.'

  const title = reporterName ? `Maqaallo uu qoray ${reporterName} | Dawan TV` : baseTitle
  const description = reporterName
    ? `Ka daalaco dhammaan maqaallada uu qoray ${reporterName}. Daboolid qoto dheer oo ku saabsan wararka Soomaaliya.`
    : baseDescription

  return {
    ...sharedMetadata,
    title,
    description,
    openGraph: {
      ...sharedMetadata.openGraph,
      title,
      description,
      url: new URL('/news', siteConfig.url).toString(),
      type: 'website',
    },
    twitter: {
      ...sharedMetadata.twitter,
      title,
      description,
    },
    alternates: {
      canonical: new URL('/news', siteConfig.url).toString(),
    },
  }
}

export const revalidate = 30

interface NewsPageProps {
  searchParams?: Promise<{
    search?: string
    page?: string
    sort?: string
    reporter?: string
  }>
}

const NewsPageSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
      <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2 rounded" />
          <Skeleton className="h-5 w-72 rounded" />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto">
          <Skeleton className="h-10 w-full sm:w-64 rounded" />
          <Skeleton className="h-10 w-full sm:w-48 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[16/10] rounded-lg sm:rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default async function NewsPage({ searchParams }: Readonly<NewsPageProps>) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  return (
    <main className="bg-gray-50 min-h-screen">
      <Suspense fallback={<NewsPageSkeleton />}>
        <NewsList searchParams={resolvedSearchParams} />
      </Suspense>
    </main>
  )
}
