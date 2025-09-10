'use client'

import React from 'react'
import { Podcast, BlogCategory } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, X, SlidersHorizontal } from 'lucide-react'
import { getUniqueSeriesNames } from '@/utils/podcastUtils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface PodcastFiltersSheetProps {
  podcasts: Podcast[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedSeries: string
  setSelectedSeries: (series: string) => void
  sortBy: 'newest' | 'oldest' | 'duration' | 'popularity'
  setSortBy: (sort: 'newest' | 'oldest' | 'duration' | 'popularity') => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

export const PodcastFiltersSheet: React.FC<PodcastFiltersSheetProps> = ({
  podcasts,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSeries,
  setSelectedSeries,
  sortBy,
  setSortBy,
  clearFilters,
  hasActiveFilters,
}) => {
  const categories = Array.from(
    new Set(
      podcasts
        .flatMap((podcast) => podcast.categories || [])
        .filter((cat): cat is BlogCategory => typeof cat === 'object' && cat !== null)
        .map((cat) => ({ id: cat.id, name: cat.name })),
    ),
  )

  const seriesNames = getUniqueSeriesNames(podcasts)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 left-6 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-[#b01c14] via-[#b01c14]/90 to-[#b01c14]/80 hover:from-[#b01c14]/90 hover:via-[#b01c14]/80 hover:to-[#b01c14]/70 text-white z-50 transition-all duration-500 hover:scale-110 hover:shadow-[#b01c14]/30"
          size="icon"
        >
          <SlidersHorizontal className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[95vw] min-w-[95vw] sm:w-[400px] sm:min-w-[400px] p-0 bg-white"
      >
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Sifee Podkaasyada</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Simple Header */}
          <div className="bg-[#b01c14] p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Sifeeyayaal</h2>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Qayb</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Dhammaan qaybaha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Dhammaan qaybaha</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Series Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Silsilad</label>
                <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Dhammaan silsiladaha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Dhammaan silsiladaha</SelectItem>
                    {seriesNames.map((series) => (
                      <SelectItem key={series.id} value={series.id}>
                        {series.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Kala saar</label>
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as 'newest' | 'oldest' | 'duration' | 'popularity')
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Kuwa ugu cusub</SelectItem>
                    <SelectItem value="oldest">Kuwa ugu duugga</SelectItem>
                    <SelectItem value="duration">Kuwa ugu dheer</SelectItem>
                    <SelectItem value="popularity">Kuwa ugu caansan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <label className="text-sm font-medium text-slate-700">Sifeeyayaasha Firfircoon</label>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <Badge variant="secondary" className="text-xs">
                        Raadinta: &quot;{searchTerm}&quot;
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-1 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedCategory !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        {categories.find((c) => c.id === selectedCategory)?.name}
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className="ml-1 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedSeries !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        {seriesNames.find((s) => s.id === selectedSeries)?.name}
                        <button
                          onClick={() => setSelectedSeries('all')}
                          className="ml-1 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>

                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Tirtir Dhammaan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
