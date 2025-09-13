'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { BlogPost } from '@/payload-types'
import { NewsCard } from '@/components/news/NewsCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, ListFilter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategorySearch } from './CategorySearch'

const POSTS_PER_PAGE = 20

interface CategoryPostsListProps {
  categorySlug: string
  categoryName: string
}

const fetchCategoryPosts = async (context: { queryKey: readonly unknown[] }) => {
  const [_key, categorySlug, page, term, sort] = context.queryKey as [
    string,
    string,
    number,
    string,
    string,
  ]

  const queryParams = new URLSearchParams({
    limit: String(POSTS_PER_PAGE),
    page: String(page),
    sort: sort,
    depth: '1',
  })

  queryParams.append('where[categories.slug][equals]', categorySlug)
  queryParams.append('where[status][equals]', 'published')

  if (term && term.trim()) {
    queryParams.append('where[name][like]', term.trim())
  }

  const apiUrl = `/api/blogPosts?${queryParams.toString()}`

  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to fetch posts')
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
}

export const CategoryPostsList: React.FC<CategoryPostsListProps> = ({
  categorySlug,
  categoryName,
}) => {
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('-createdAt')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    setSearchTerm(urlSearch)

    if (urlSearch !== searchTerm) {
      setCurrentPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['categoryPosts', categorySlug, currentPage, searchTerm, sortBy],
    queryFn: fetchCategoryPosts,
    staleTime: 1000 * 60,
  })

  useEffect(() => {
    refetch()
  }, [searchTerm, refetch])

  const totalPages: number = data?.totalPages || 1

  const posts = useMemo(() => {
    const allPosts: BlogPost[] = data?.docs || []

    if (!searchTerm || !searchTerm.trim()) {
      return allPosts
    }

    const term = searchTerm.trim().toLowerCase()
    const filtered = allPosts.filter((post) => post.name?.toLowerCase().includes(term))
    return filtered
  }, [data?.docs, searchTerm])

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500">
          Khalad soo raridda wararka: {error?.message || 'Khalad aan la garanayn'}
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
      <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-gray-900 mb-1 sm:mb-2">
            {categoryName}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            Ka raadi maqaallo ku saabsan {categoryName.toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto">
          <CategorySearch
            inputClassName="h-9 sm:h-10 w-full bg-white shadow-sm text-sm"
            className="w-full sm:flex-grow"
            categorySlug={categorySlug}
            onSearchChange={handleSearchChange}
          />
          <Select value={sortBy} onValueChange={handleSortChange}>
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

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {Array.from({ length: POSTS_PER_PAGE > 12 ? 12 : POSTS_PER_PAGE }).map((_, i) => (
            <Skeleton key={i} className="aspect-[16/10] rounded-lg sm:rounded-xl" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {posts.map((post) => (
            <NewsCard key={post.id} post={post} showCategories={false} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8 md:py-10">
          <p className="text-lg sm:text-xl text-gray-500">Maqaallo lagama helin qaybtaan.</p>
          {searchTerm && (
            <p className="text-sm text-gray-400 mt-2">
              Isku day inaad wax ka beddesho raadinta ama sifaynta.
            </p>
          )}
        </div>
      )}

      {totalPages > 1 && !isLoading && posts.length > 0 && (
        <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-[#b01c14]/80 hover:text-[#b01c14]"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <span className="text-xs sm:text-sm text-gray-700">
            Bogga {currentPage} ee {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-[#b01c14]/80 hover:text-[#b01c14]"
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
