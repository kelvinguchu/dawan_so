import { unstable_cache } from 'next/cache'

const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1'

function getValidatedApiKey(): string {
  const apiKey = process.env.COIN_MARKET_CAP_API_KEY
  if (!apiKey) {
    throw new Error('COIN_MARKET_CAP_API_KEY environment variable is required')
  }
  return apiKey
}

interface CoinMarketCapCoin {
  id: number
  name: string
  symbol: string
  cmc_rank: number
  circulating_supply: number
  quote: {
    USD: {
      price: number
      market_cap: number
      volume_24h: number
      percent_change_24h: number
      percent_change_7d: number
    }
  }
}

interface CoinMarketCapGlobalData {
  data: {
    quote: {
      USD: {
        total_market_cap: number
        total_volume_24h: number
        total_market_cap_yesterday_percentage_change: number
      }
    }
    btc_dominance: number
    eth_dominance: number
    total_cryptocurrencies: number
  }
}

interface CoinMarketCapListingsResponse {
  data: CoinMarketCapCoin[]
  status: {
    total_count: number
  }
}

export interface CryptoCurrency {
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

export interface GlobalMarketData {
  totalMarketCap: number
  totalVolume: number
  btcDominance: number
  ethDominance?: number
  marketCapChange: number
  activeCryptocurrencies?: number
}

export interface TrendingCoin {
  id: number
  name: string
  symbol: string
  price: number
  percentChange24h: number
  logoUrl: string
}

export interface MarketDataResult {
  data: CryptoCurrency[]
  totalCount: number
}

export const getGlobalMarketData = unstable_cache(
  async (): Promise<GlobalMarketData> => {
    try {
      const globalDataResponse = await fetch(`${CMC_API_URL}/global-metrics/quotes/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': getValidatedApiKey(),
          Accept: 'application/json',
        },
        cache: 'no-store',
      })

      if (!globalDataResponse.ok) {
        throw new Error(`CoinMarketCap API error: ${globalDataResponse.status}`)
      }

      const globalData: CoinMarketCapGlobalData = await globalDataResponse.json()

      return {
        totalMarketCap: globalData.data.quote.USD.total_market_cap,
        totalVolume: globalData.data.quote.USD.total_volume_24h,
        btcDominance: globalData.data.btc_dominance,
        ethDominance: globalData.data.eth_dominance,
        marketCapChange: globalData.data.quote.USD.total_market_cap_yesterday_percentage_change,
        activeCryptocurrencies: globalData.data.total_cryptocurrencies,
      }
    } catch (error: unknown) {
      console.error('Error fetching global market data:', error)
      throw new Error('Failed to fetch global market data')
    }
  },
  ['global-market-data'],
  {
    revalidate: 60,
    tags: ['crypto-global'],
  },
)

export const getTrendingCoins = unstable_cache(
  async (): Promise<TrendingCoin[]> => {
    try {
      const response = await fetch(
        `${CMC_API_URL}/cryptocurrency/listings/latest?limit=10&sort=percent_change_24h&sort_dir=desc&convert=USD`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': getValidatedApiKey(),
            Accept: 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`CoinMarketCap API error: ${response.status}`)
      }

      const data: CoinMarketCapListingsResponse = await response.json()

      return data.data.map((coin: CoinMarketCapCoin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        price: coin.quote.USD.price,
        percentChange24h: coin.quote.USD.percent_change_24h,
        logoUrl: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
      }))
    } catch (error: unknown) {
      console.error('Error fetching trending cryptocurrencies:', error)
      throw new Error('Failed to fetch trending cryptocurrencies')
    }
  },
  ['trending-coins'],
  {
    revalidate: 120,
    tags: ['crypto-trending'],
  },
)

const getMarketListingsInternal = async (
  page: number = 1,
  limit: number = 20,
  searchTerm: string = '',
  sortBy: string = 'market_cap_desc',
): Promise<MarketDataResult> => {
  try {
    const start = (page - 1) * limit + 1
    const sortDir = sortBy.includes('asc') ? 'asc' : 'desc'
    const sortParam = sortBy.replace('_asc', '').replace('_desc', '')

    const sortMapping: { [key: string]: string } = {
      market_cap: 'market_cap',
      volume: 'volume_24h',
      price: 'price',
      percent_change_24h: 'percent_change_24h',
    }

    const apiSort = sortMapping[sortParam] || 'market_cap'

    const url = new URL(`${CMC_API_URL}/cryptocurrency/listings/latest`)
    url.searchParams.append('limit', String(limit))
    url.searchParams.append('start', String(start))
    url.searchParams.append('sort', apiSort)
    url.searchParams.append('sort_dir', sortDir)
    url.searchParams.append('convert', 'USD')

    const response = await fetch(url.toString(), {
      headers: {
        'X-CMC_PRO_API_KEY': getValidatedApiKey(),
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`)
    }

    const data: CoinMarketCapListingsResponse = await response.json()

    const cryptocurrencies: CryptoCurrency[] = data.data.map((coin: CoinMarketCapCoin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      marketCap: coin.quote.USD.market_cap,
      volume24h: coin.quote.USD.volume_24h,
      circulatingSupply: coin.circulating_supply,
      percentChange24h: coin.quote.USD.percent_change_24h,
      percentChange7d: coin.quote.USD.percent_change_7d,
      rank: coin.cmc_rank,
      logoUrl: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
    }))

    let results = cryptocurrencies
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = cryptocurrencies.filter(
        (crypto: CryptoCurrency) =>
          crypto.name.toLowerCase().includes(term) || crypto.symbol.toLowerCase().includes(term),
      )
    }

    return {
      data: results,
      totalCount: data.status.total_count,
    }
  } catch (error: unknown) {
    console.error('Error fetching cryptocurrency listings:', error)
    throw new Error('Failed to fetch cryptocurrency listings')
  }
}

export const getMarketListings = (
  page: number = 1,
  limit: number = 20,
  searchTerm: string = '',
  sortBy: string = 'market_cap_desc',
): Promise<MarketDataResult> => {
  // Build cache key with parameters
  const keyParts = ['market-listings', page.toString(), limit.toString(), searchTerm || '', sortBy]

  return unstable_cache(
    () => getMarketListingsInternal(page, limit, searchTerm, sortBy),
    keyParts,
    {
      revalidate: 30,
      tags: ['crypto-listings'],
    },
  )()
}
