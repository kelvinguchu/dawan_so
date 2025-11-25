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
import { getUniquePlaylistNames } from '@/utils/podcastUtils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

type SortOption = 'newest' | 'oldest' | 'popularity'

interface PodcastFiltersSheetProps {
  podcasts: Podcast[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedPlaylist: string
  setSelectedPlaylist: (playlist: string) => void
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

export const PodcastFiltersSheet: React.FC<PodcastFiltersSheetProps> = ({
  podcasts,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedPlaylist,
  setSelectedPlaylist,
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

  const playlistNames = getUniquePlaylistNames(podcasts)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 w-16 h-16 flex items-center justify-center group hover:scale-105 cursor-pointer"
          aria-label="Sifee Podkaasyada"
        >
          <div className="w-12 h-12 flex items-center justify-center bg-[#b01c14] group-hover:bg-[#8e140f] text-white rounded-lg transition-colors">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
        </button>
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
                <div className="text-sm font-medium text-slate-700">Qayb</div>
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

              {/* Playlist Filter */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">Liiska</div>
                <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Dhammaan liisaska" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Dhammaan liisaska</SelectItem>
                    {playlistNames.map((playlist) => (
                      <SelectItem key={playlist.id} value={playlist.id}>
                        {playlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">Kala saar</div>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Kuwa ugu cusub</SelectItem>
                    <SelectItem value="oldest">Kuwa ugu duugga</SelectItem>
                    <SelectItem value="popularity">Kuwa ugu caansan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <div className="text-sm font-medium text-slate-700">Sifeeyayaasha Firfircoon</div>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <Badge variant="secondary" className="text-xs">
                        Raadinta: &quot;{searchTerm}&quot;
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-1 hover:text-slate-600 cursor-pointer"
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
                          className="ml-1 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedPlaylist !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        {playlistNames.find((p) => p.id === selectedPlaylist)?.name}
                        <button
                          onClick={() => setSelectedPlaylist('all')}
                          className="ml-1 hover:text-slate-600 cursor-pointer"
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
