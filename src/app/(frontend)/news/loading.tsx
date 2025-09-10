import React from 'react'
import { Loading } from '@/components/global/Loading'

export default function NewsListLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <Loading fullScreen={false} message="Maqaallada waa la rarayaa..." />
      </div>
    </div>
  )
} 
