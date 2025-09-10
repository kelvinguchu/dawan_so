import React, { Suspense } from 'react'
import { MarketStats } from './MarketStats'
import { TrendingCoins } from './TrendingCoins'
import { MarketTable } from './MarketTable'
import { RefreshWidget } from './RefreshWidget'
import { getCryptoListings } from '@/lib/market-actions'
import { Skeleton } from '@/components/ui/skeleton'

const MarketTableSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-4">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-1/2"></div>
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="h-16 bg-gray-100 rounded mb-2"></div>
      ))}
    </div>
  </div>
)

export async function CryptoMarkets({ page, sortBy, searchTerm }: { page: number, sortBy: string, searchTerm: string }) {
  const limit = 20

  const initialTableData = await getCryptoListings({
    limit,
    start: (page - 1) * limit + 1,
    sortBy,
    searchTerm,
  })

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
      <div className="mb-6 sm:mb-8 md:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Suuqyada Kriptoyada
        </h1>
        <p className="text-gray-600 text-lg">
          La soco qiimayaasha waqtiga-dhabta ah iyo xogta suuqa ee kriptooyinka ugu sarreeya
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <MarketStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 mt-6">
        <div className="lg:col-span-1">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <TrendingCoins />
          </Suspense>
        </div>

        <div className="lg:col-span-3">
          <Suspense fallback={<MarketTableSkeleton />}>
            <MarketTable initialData={initialTableData} />
          </Suspense>
        </div>
      </div>

      <RefreshWidget />
    </div>
  )
}
