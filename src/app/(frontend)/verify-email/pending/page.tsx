import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { PendingVerificationClient } from './PendingVerificationClient'

export const metadata: Metadata = {
  title: 'Sug xaqiijinta email-ka | Dawan Somali',
  description: 'Hubi email-kaaga si aad u hawlgeliso akoonkaaga Dawan Somali.',
  robots: 'noindex, nofollow',
}

interface PendingVerificationPageProps {
  searchParams: Promise<{ email?: string }>
}

async function PendingVerificationContent({ searchParams }: PendingVerificationPageProps) {
  const params = await searchParams
  const cookieStore = await cookies()
  const cachedEmail = cookieStore.get('last-registered-email')?.value
  const email = params.email ?? cachedEmail ?? ''

  return <PendingVerificationClient initialEmail={email} />
}

export default function PendingVerificationPage(props: PendingVerificationPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-16 sm:py-24">
      <Suspense
        fallback={
          <div className="text-sm text-slate-500">Diyaarinaya tilmaamaha xaqiijinta...</div>
        }
      >
        <PendingVerificationContent {...props} />
      </Suspense>
    </div>
  )
}
