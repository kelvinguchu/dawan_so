import { useState, useEffect } from 'react'

interface CryptoCurrency {
  id: number
  name: string
  symbol: string
  price: number
  marketCap: number
  volume24h: number
  circulatingSupply: number
  percentChange24h: number
  percentChange7d: number
  rank: number
  logoUrl: string
}

interface UseMarketDataResult {
  data: CryptoCurrency[]
  totalCount: number
  isLoading: boolean
  error: string | null
}


export const useMarketData = (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = '',
  sortBy: string = 'market_cap_desc',
): UseMarketDataResult => {
  const [result, setResult] = useState<UseMarketDataResult>({
    data: [],
    totalCount: 0,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      setResult((prev) => ({ ...prev, isLoading: true }))

      try {
        const start = (page - 1) * limit + 1

        const params = new URLSearchParams({
          limit: String(limit),
          start: String(start),
          sort: sortBy,
        })

        if (searchTerm) {
          params.append('search', searchTerm)
        }

        const response = await fetch(`/api/crypto/listings?${params.toString()}`)

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        setResult({
          data: data.data,
          totalCount: data.totalCount,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        console.error('Error fetching market data:', error)
        setResult((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load market data',
        }))
      }
    }

    fetchData()
  }, [page, limit, searchTerm, sortBy])

  return result
}
