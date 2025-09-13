'use client'

import React from 'react'
import { AdUnit } from '@/components/ads/AdUnit'

export function InArticleAd() {
  return (
    <div className="my-8 w-full">
      <AdUnit
        slotId="4145404072"
        adFormat="fluid"
        isResponsive={true}
        inArticle={true}
        className="w-full"
      />
    </div>
  )
}
