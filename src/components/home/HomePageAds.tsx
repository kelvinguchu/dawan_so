'use client'

import React from 'react'
import { AdUnit } from '@/components/ads/AdUnit'

export const HomePageAdSection: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <section className={`bg-gray-50 mb-6 ${className}`}>
      <div className="container mx-auto flex justify-center items-center min-h-[280px]">
        <AdUnit slotId="6979268824" className="max-w-4xl w-full" />
      </div>
    </section>
  )
}

export const HomePageBottomAdSection: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <section className={`bg-white my-6 ${className}`}>
      <div className="container mx-auto flex justify-center items-center min-h-[280px]">
        <AdUnit slotId="6979268824" className="max-w-4xl w-full" />
      </div>
    </section>
  )
}
