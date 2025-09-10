import React from 'react'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, Activity, DollarSign, Bitcoin } from 'lucide-react'
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters'
import { getGlobalMarketData } from '@/lib/market-actions'

export async function MarketStats({ className }: { className?: string }) {
  const stats = await getGlobalMarketData()

  if (!stats) {
    return (
      <div className={`text-red-500 text-xs ${className}`}>
        Lama soo rarin xogta suuqa. Fadlan mar dambe isku day.
      </div>
    )
  }

  const statsList = [
    {
      title: 'Qiimaha Suuqa',
      value: formatCurrency(stats.totalMarketCap, 0),
      change: stats.marketCapChange,
      icon: <Activity className="h-3.5 w-3.5 text-gray-500" />,
    },
    {
      title: 'Mugga 24-saac',
      value: formatCurrency(stats.totalVolume, 0),
      icon: <DollarSign className="h-3.5 w-3.5 text-gray-500" />,
    },
    {
      title: 'Saamiga BTC',
      value: formatPercentage(stats.btcDominance),
      icon: <Bitcoin className="h-3.5 w-3.5 text-gray-500" />,
    },
    {
      title: 'Kriptoyo',
      value: formatNumber(stats.activeCryptocurrencies ?? 0),
      icon: <TrendingUp className="h-3.5 w-3.5 text-gray-500" />,
    },
  ]

  return (
    <div className={`border rounded-md bg-white shadow-sm py-1.5 px-2 text-xs ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-1.5">
        {statsList.map((stat, index) => (
          <div key={index} className="flex items-center">
            {stat.icon}
            <span className="ml-1 text-gray-500">{stat.title}:</span>
            <span className="ml-1 font-medium">{stat.value}</span>
            {stat.change !== undefined && (
              <span
                className={`flex items-center ml-1 ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? (
                  <ArrowUpIcon className="w-2.5 h-2.5" />
                ) : (
                  <ArrowDownIcon className="w-2.5 h-2.5" />
                )}
                <span className="text-[10px]">{formatPercentage(Math.abs(stat.change))}</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
