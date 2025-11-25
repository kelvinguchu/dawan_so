import React from 'react'
import { Loading } from '@/components/global/Loading'

export default function ArticleLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Loading fullScreen={false} message="Maqaalka waa la soo dejinayaa..." />
      </div>
    </div>
  )
}
