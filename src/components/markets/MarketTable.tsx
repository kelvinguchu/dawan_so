'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ArrowUpIcon, ArrowDownIcon, Search, ListFilter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters'
import Image from 'next/image'

// Define the type for a single cryptocurrency
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

// Define the props for the MarketTable component
interface MarketTableProps {
  initialData: {
    data: CryptoCurrency[]
    totalCount: number
  }
}

export const MarketTable: React.FC<MarketTableProps> = ({ initialData }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get('page') || '1')
  const sortBy = searchParams.get('sort') || 'market_cap_desc'
  const searchTerm = searchParams.get('search') || ''

  const { data: cryptoData, totalCount } = initialData
  const itemsPerPage = 20
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    if (name !== 'page') {
      params.set('page', '1')
    }
    return params.toString()
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(pathname + '?' + createQueryString('search', e.target.value))
  }

  const handleSort = (newSortBy: string) => {
    router.push(pathname + '?' + createQueryString('sort', newSortBy))
  }

  const handlePageChange = (newPage: number) => {
    router.push(pathname + '?' + createQueryString('page', String(newPage)))
  }

  const pageNumbers = []
  for (let i = 1; i <= Math.min(5, totalPages); i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="w-full sm:w-auto relative">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Raadi kripto..."
              defaultValue={searchTerm}
              onChange={handleSearch}
              className="pl-8 h-9 bg-white shadow-sm text-sm w-full sm:w-64"
            />
          </div>
        </div>
        <Select value={sortBy} onValueChange={handleSort}>
          <SelectTrigger className="h-9 w-full sm:w-44 bg-white shadow-sm text-xs">
            <ListFilter className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <SelectValue placeholder="Kala saar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market_cap_desc">Qiimaha Suuqa (Sare ilaa Hoose)</SelectItem>
            <SelectItem value="market_cap_asc">Qiimaha Suuqa (Hoose ilaa Sare)</SelectItem>
            <SelectItem value="volume_desc">Mugga (Sare ilaa Hoose)</SelectItem>
            <SelectItem value="volume_asc">Mugga (Hoose ilaa Sare)</SelectItem>
            <SelectItem value="price_desc">Qiimaha (Sare ilaa Hoose)</SelectItem>
            <SelectItem value="price_asc">Qiimaha (Hoose ilaa Sare)</SelectItem>
            <SelectItem value="percent_change_24h_desc">Isbeddel 24-saac (Sare ilaa Hoose)</SelectItem>
            <SelectItem value="percent_change_24h_asc">Isbeddel 24-saac (Hoose ilaa Sare)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Magac</TableHead>
              <TableHead className="text-right">Qiimaha</TableHead>
              <TableHead className="text-right">24-saac %</TableHead>
              <TableHead className="text-right md:table-cell hidden">7-maalmood %</TableHead>
              <TableHead className="text-right lg:table-cell hidden">Qiimaha Suuqa</TableHead>
              <TableHead className="text-right xl:table-cell hidden">Mugga (24-saac)</TableHead>
              <TableHead className="text-right xl:table-cell hidden">Sahayda Wareegaysa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cryptoData.map((crypto: CryptoCurrency) => (
              <TableRow key={crypto.id} className="hover:bg-gray-50">
                <TableCell>{crypto.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Image
                      src={crypto.logoUrl}
                      alt={crypto.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 mr-2"
                    />
                    <div>
                      <span className="font-medium">{crypto.name}</span>
                      <span className="text-gray-500 text-xs ml-2">{crypto.symbol}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(crypto.price)}</TableCell>
                <TableCell className="text-right">
                  <div
                    className={`inline-flex items-center ${crypto.percentChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {crypto.percentChange24h >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3 mr-1" />
                    )}
                    {formatPercentage(crypto.percentChange24h)}
                  </div>
                </TableCell>
                <TableCell className="text-right md:table-cell hidden">
                  <div
                    className={`inline-flex items-center ${crypto.percentChange7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {crypto.percentChange7d >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3 mr-1" />
                    )}
                    {formatPercentage(crypto.percentChange7d)}
                  </div>
                </TableCell>
                <TableCell className="text-right lg:table-cell hidden">{formatCurrency(crypto.marketCap, 0)}</TableCell>
                <TableCell className="text-right xl:table-cell hidden">{formatCurrency(crypto.volume24h, 0)}</TableCell>
                <TableCell className="text-right xl:table-cell hidden">
                  {formatNumber(crypto.circulatingSupply)}{' '}
                  <span className="text-gray-500">{crypto.symbol}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="py-4 px-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) handlePageChange(page - 1)
                  }}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {pageNumbers.map((number) => (
                <PaginationItem key={number} className="hidden sm:inline-block">
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(number)
                    }}
                    isActive={page === number}>
                    {number}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {totalPages > 5 && (
                <PaginationItem className="hidden sm:inline-block">
                  <span className="flex h-9 w-9 items-center justify-center">...</span>
                </PaginationItem>
              )}

              <PaginationItem className="sm:hidden">
                <span className="flex h-9 items-center justify-center px-2 text-sm text-muted-foreground">
                  Bogga {page} ee {totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) handlePageChange(page + 1)
                  }}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
