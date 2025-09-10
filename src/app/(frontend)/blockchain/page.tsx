import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { BlockchainNewsList } from '@/components/news/BlockchainNewsList'
import { sharedMetadata } from '@/app/shared-metadata'
import siteConfig from '@/app/shared-metadata'
import { CryptoMarkets } from '@/components/markets/CryptoMarkets'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Blockchain | Dawan TV - Suuqyada Maaliyadeed ee Afrika & Falanqayn',
  description:
    'La soco suuqyada maaliyadeed ee Afrika, xog waqtiga-dhabta ah, falanqayn khubaro iyo aragtiyo ku saabsan dhaqaalaha iyo ganacsiga.',
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Blockchain | Dawan TV - Suuqyada Maaliyadeed ee Afrika & Falanqayn',
    description:
      'La soco suuqyada maaliyadeed ee Afrika, xog waqtiga-dhabta ah, falanqayn khubaro iyo aragtiyo ku saabsan dhaqaalaha iyo ganacsiga.',
    url: new URL('/blockchain', siteConfig.url).toString(),
    type: 'website',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Dawan TV - Suuqyada Maaliyadeed ee Afrika & Falanqayn',
      },
    ],
  },
  twitter: {
    ...sharedMetadata.twitter,
    title: 'Blockchain | Dawan TV - Suuqyada Maaliyadeed ee Afrika & Falanqayn',
    description:
      'La soco suuqyada maaliyadeed ee Afrika, xog waqtiga-dhabta ah, falanqayn khubaro iyo aragtiyo ku saabsan dhaqaalaha iyo ganacsiga.',
    images: ['/og-default.png'],
  },
  alternates: {
    canonical: new URL('/blockchain', siteConfig.url).toString(),
  },
}

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const page = Number(sp?.page) || 1
  const sortBy = (sp?.sort as string) || 'market_cap_desc'
  const searchTerm = (sp?.search as string) || ''

  return (
    <main className="bg-gray-50 min-h-screen">
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-screen w-full" />
          </div>
        }
      >
        <CryptoMarkets page={page} sortBy={sortBy} searchTerm={searchTerm} />
      </Suspense>
      <BlockchainNewsList limit={8} />
    </main>
  )
}
