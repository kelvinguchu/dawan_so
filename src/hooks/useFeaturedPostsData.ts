import { useMemo } from 'react'
import { BlogPost, BlogCategory } from '@/payload-types'
import { subDays } from 'date-fns'
import { useQuery } from '@tanstack/react-query'

interface UseFeaturedPostsDataProps {
  excludePostIds?: string[]
  activeTab: string
}

interface FetchError extends Error {
  info?: Record<string, unknown>
  status?: number
}

interface WhereClause {
  and: Array<Record<string, unknown>>
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({}))
    const error = new Error('An error occurred while fetching the data.') as FetchError
    error.info = errorDetails
    error.status = response.status
    throw error
  }
  return response.json()
}

interface UseFeaturedPostsDataReturn {
  posts: BlogPost[]
  categories: BlogCategory[]
  isLoadingPosts: boolean
  isLoadingCategories: boolean
  postsError: FetchError | null
  categoriesError: FetchError | null
}

export const useFeaturedPostsData = ({
  excludePostIds = [],
  activeTab,
}: UseFeaturedPostsDataProps): UseFeaturedPostsDataReturn => {
  const stableExcludePostIds = useMemo(() => excludePostIds.join(','), [excludePostIds])

  const thirtyDaysAgo = useMemo(() => subDays(new Date(), 30).toISOString(), [])

  const queryParamsObject = useMemo(() => {
    const baseParams: Record<string, string> = {
      limit: '6',
      depth: '2',
    }
    const whereClause: WhereClause = { and: [] }

    if (activeTab === 'trending') {
      baseParams.sort = '-views'
      whereClause.and.push({
        createdAt: {
          greater_than: thirtyDaysAgo,
        },
      })
    } else if (activeTab === 'editors') {
      baseParams.sort = '-createdAt'
      whereClause.and.push({
        isEditorsPick: {
          equals: true,
        },
      })
    } else {
      baseParams.sort = '-createdAt'
    }

    if (stableExcludePostIds) {
      whereClause.and.push({
        id: {
          not_in: stableExcludePostIds.split(',').filter((id) => id),
        },
      })
    }

    if (whereClause.and.length > 0) {
      baseParams.where = JSON.stringify(whereClause)
    }

    return baseParams
  }, [thirtyDaysAgo, stableExcludePostIds, activeTab])

  const postsQueryKey = ['blogPosts', `featured-${activeTab}`, queryParamsObject]

  const {
    data: postsData,
    error: postsError,
    isLoading: isLoadingPosts,
  } = useQuery<
    {
      docs: BlogPost[]
    },
    Error
  >({
    queryKey: postsQueryKey,
    queryFn: () => fetcher(`/api/blogPosts?${new URLSearchParams(queryParamsObject).toString()}`),
  })

  const categoriesQueryKey = ['blogCategories', 'all']
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: isLoadingCategories,
  } = useQuery<
    {
      docs: BlogCategory[]
    },
    Error
  >({
    queryKey: categoriesQueryKey,
    queryFn: () => fetcher('/api/blogCategories'),
  })

  return {
    posts: postsData?.docs || [],
    categories: categoriesData?.docs || [],
    isLoadingPosts,
    isLoadingCategories,
    postsError,
    categoriesError,
  }
}
