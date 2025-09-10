'use client'

import React, { useState, useCallback, startTransition } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { revalidateMarketData } from '@/lib/market-actions'
import { useRouter } from 'next/navigation'

export const RefreshWidget: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await revalidateMarketData()
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error refreshing market data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [router])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="h-8 text-xs"
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Cusboonaysiinaya...
          </>
        ) : (
          <>
            <RefreshCw className="h-3 w-3 mr-1" />
            Cusbooneysii
          </>
        )}
      </Button>
    </div>
  )
}
