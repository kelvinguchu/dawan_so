'use server'

import { revalidateTag } from 'next/cache'

const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1'

// Type definitions for CoinMarketCap API responses
interface Coin {
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

function getValidatedApiKey(): string {
  const apiKey = process.env.COIN_MARKET_CAP_API_KEY
  if (!apiKey) {
    throw new Error('COIN_MARKET_CAP_API_KEY environment variable is required')
  }
  return apiKey
}

// Data Fetching Actions

export async function getGlobalMarketData() {
  try {
    const response = await fetch(`${CMC_API_URL}/global-metrics/quotes/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': getValidatedApiKey(),
        Accept: 'application/json',
      },
      next: { revalidate: 60, tags: ['crypto-global'] },
    })

    if (!response.ok) {
      console.error('CoinMarketCap API error:', await response.text())
      return null
    }

    const globalData = await response.json()

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
    return null
  }
}

export async function getCryptoListings(params: {
  limit: number
  start: number
  sortBy: string
  searchTerm?: string
}) {
  try {
    const { limit, start, sortBy, searchTerm } = params

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
      next: { revalidate: 60, tags: ['crypto-listings'] },
    })

    if (!response.ok) {
      console.error('CoinMarketCap API error:', await response.text())
      return { data: [], totalCount: 0 }
    }

    const data = await response.json()

    const allCryptos = data.data.map((coin: Coin) => ({
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

    let filteredCryptos = allCryptos
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim()
      filteredCryptos = allCryptos.filter(
        (crypto: { name: string; symbol: string }) =>
          crypto.name.toLowerCase().includes(term) || crypto.symbol.toLowerCase().includes(term),
      )
    }

    return {
      data: filteredCryptos,
      totalCount: data.status.total_count,
    }
  } catch (error) {
    console.error('Error fetching cryptocurrency listings:', error)
    return { data: [], totalCount: 0 }
  }
}

export async function getTrendingCoins() {
  try {
    const response = await fetch(
      `${CMC_API_URL}/cryptocurrency/listings/latest?limit=10&sort=percent_change_24h&sort_dir=desc&convert=USD`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': getValidatedApiKey(),
          Accept: 'application/json',
        },
        next: { revalidate: 300, tags: ['crypto-trending'] },
      },
    )

    if (!response.ok) {
      console.error('CoinMarketCap API error:', await response.text())
      return []
    }

    const data = await response.json()

    return data.data.map((coin: Coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      percentChange24h: coin.quote.USD.percent_change_24h,
      logoUrl: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
    }))
  } catch (error) {
    console.error('Error fetching trending cryptocurrencies:', error)
    return []
  }
}

// Cache Revalidation Actions

export async function revalidateMarketData() {
  try {
    revalidateTag('crypto-global')
    revalidateTag('crypto-trending')
    revalidateTag('crypto-listings')

    return { success: true }
  } catch (error) {
    console.error('Error revalidating market data:', error)
    return { success: false, error: 'Failed to revalidate cache' }
  }
}

export async function revalidateGlobalData() {
  try {
    revalidateTag('crypto-global')
    return { success: true }
  } catch (error) {
    console.error('Error revalidating global data:', error)
    return { success: false, error: 'Failed to revalidate global cache' }
  }
}

export async function revalidateTrendingData() {
  try {
    revalidateTag('crypto-trending')
    return { success: true }
  } catch (error) {
    console.error('Error revalidating trending data:', error)
    return { success: false, error: 'Failed to revalidate trending cache' }
  }
}

export async function revalidateListingsData() {
  try {
    revalidateTag('crypto-listings')
    return { success: true }
  } catch (error) {
    console.error('Error revalidating listings data:', error)
    return { success: false, error: 'Failed to revalidate listings cache' }
  }
}
