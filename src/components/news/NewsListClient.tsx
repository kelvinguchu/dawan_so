'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchInput } from '@/components/common/SearchInput'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { ListFilter, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface NewsListClientProps {
  initialSearchTerm: string
  initialSortBy: string
  currentPage: number
  totalPages: number
  reporterName?: string
}

export const NewsListClient: React.FC<NewsListClientProps> = ({ initialSortBy, reporterName }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })

    const search = current.toString()
    const query = search ? `?${search}` : ''
    router.push(`/news${query}`)
  }

  const handleSortChange = (value: string) => {
    updateSearchParams({
      sort: value === '-createdAt' ? null : value,
      page: null,
    })
  }

  return (
    <>
      {reporterName && (
        <div className="mb-4">
          <Link
            href="/news"
            className="inline-flex items-center text-[#b01c14] hover:text-[#b01c14]/80 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ku noqo Dhammaan Wararka
          </Link>
        </div>
      )}
      <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-gray-900 mb-1 sm:mb-2">
            {reporterName ? `Maqaallo uu qoray ${reporterName}` : 'Wararkii Ugu Dambeeyay'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            {reporterName
              ? `Ka daalaco dhammaan maqaallada uu qoray ${reporterName}.`
              : 'La soco maqaalladayadii iyo aragtiyadii ugu dambeeyay.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto">
          <SearchInput
            inputClassName="h-9 sm:h-10 w-full bg-white shadow-sm text-sm"
            className="w-full sm:flex-grow"
            redirectPath="/news"
          />
          <Select value={initialSortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="h-9 sm:h-10 w-full sm:w-40 md:w-48 bg-white shadow-sm text-xs sm:text-sm">
              <ListFilter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />
              <SelectValue placeholder="Kala saar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Kuwa Ugu Cusub</SelectItem>
              <SelectItem value="createdAt">Kuwa Ugu Duugga</SelectItem>
              <SelectItem value="name">Alfabeet (A-Z)</SelectItem>
              <SelectItem value="-name">Alfabeet (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}

interface PaginationClientProps {
  currentPage: number
  totalPages: number
}

export const PaginationClient: React.FC<PaginationClientProps> = ({ currentPage, totalPages }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })

    const search = current.toString()
    const query = search ? `?${search}` : ''
    router.push(`/news${query}`)
  }

  const goToPage = (page: number) => {
    updateSearchParams({
      page: page === 1 ? null : String(page),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getVisiblePageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  return (
    <Pagination className="mt-8 sm:mt-10 md:mt-12">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) goToPage(currentPage - 1)
            }}
            className={
              currentPage === 1
                ? 'pointer-events-none opacity-50'
                : 'hover:bg-[#b01c14]/80 hover:text-[#b01c14]'
            }
          />
        </PaginationItem>

        {getVisiblePageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  goToPage(page as number)
                }}
                isActive={currentPage === page}
                className={
                  currentPage === page
                    ? 'bg-[#b01c14] text-white'
                    : 'hover:bg-[#b01c14]/80 hover:text-[#b01c14]'
                }
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) goToPage(currentPage + 1)
            }}
            className={
              currentPage === totalPages
                ? 'pointer-events-none opacity-50'
                : 'hover:bg-[#b01c14]/80 hover:text-[#b01c14]'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
