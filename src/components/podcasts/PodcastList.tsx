'use client'

import React, { useState } from 'react'
import { Podcast } from '@/payload-types'
import { PodcastCard } from './PodcastCard'
import { PodcastFiltersSheet } from './PodcastFiltersSheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Grid3X3, List, Search, X } from 'lucide-react'

interface PodcastListProps {
  podcasts: Podcast[]
  title?: string
  showFilters?: boolean
  defaultView?: 'grid' | 'list'
  showSearch?: boolean
  className?: string
}

export const PodcastList: React.FC<PodcastListProps> = ({
  podcasts,
  title = 'Podkaastyada',
  showFilters = true,
  defaultView = 'grid',
  showSearch = true,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSeries, setSelectedSeries] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration' | 'popularity'>('newest')

  // Filter and sort podcasts
  const filteredPodcasts = podcasts.filter((podcast) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesTitle = podcast.title.toLowerCase().includes(searchLower)
      const matchesDescription = podcast.description?.toLowerCase().includes(searchLower)
      const matchesPeople = podcast.peopleInvolved?.some((person) =>
        person.name?.toLowerCase().includes(searchLower),
      )
      if (!matchesTitle && !matchesDescription && !matchesPeople) return false
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const hasCategory = podcast.categories?.some((cat) =>
        typeof cat === 'object' ? cat.id === selectedCategory : false,
      )
      if (!hasCategory) return false
    }

    // Series filter
    if (selectedSeries !== 'all') {
      const podcastSeries = typeof podcast.series === 'object' ? podcast.series : null
      if (!podcastSeries || podcastSeries.id !== selectedSeries) return false
    }

    return true
  })

  // Sort podcasts
  filteredPodcasts.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (
          new Date(b.publishedAt ?? b.createdAt).getTime() -
          new Date(a.publishedAt ?? a.createdAt).getTime()
        )
      case 'oldest':
        return (
          new Date(a.publishedAt ?? a.createdAt).getTime() -
          new Date(b.publishedAt ?? b.createdAt).getTime()
        )
      case 'duration':
        return (b.duration ?? 0) - (a.duration ?? 0)
      case 'popularity':
        return (b.playCount ?? 0) - (a.playCount ?? 0)
      default:
        return 0
    }
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(searchInput.trim())
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchTerm('')
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSearchInput('')
    setSelectedCategory('all')
    setSelectedSeries('all')
    setSortBy('newest')
  }

  const hasActiveFilters = Boolean(
    searchTerm || selectedCategory !== 'all' || selectedSeries !== 'all',
  )

  return (
    <div className={`bg-white min-h-screen ${className}`}>
      <div className="container mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Title and Switcher on same line */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-[#b01c14]">{title}</h1>

              {/* View Mode Switcher */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-8 px-3 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-[#b01c14] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-8 px-3 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-[#b01c14] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search Bar below */}
            {showSearch && (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search podcasts..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 pr-10 h-10 border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/20 rounded-lg"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#b01c14] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  className="h-10 px-3 bg-[#b01c14] hover:bg-[#b01c14]/90 text-white rounded-lg"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:items-center justify-between gap-6">
            <h1 className="text-3xl font-bold text-[#b01c14]">{title}</h1>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              {showSearch && (
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Raadi podkaasyo..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10 pr-10 h-10 w-64 border-slate-200 focus:border-[#b01c14] focus:ring-[#b01c14]/20 rounded-lg"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#b01c14] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="h-10 px-3 bg-[#b01c14] hover:bg-[#b01c14]/90 text-white rounded-lg"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
              )}

              {/* View Mode Switcher */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-8 px-3 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-[#b01c14] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-8 px-3 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-[#b01c14] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }
        >
          {filteredPodcasts.map((podcast) => (
            <PodcastCard
              key={podcast.id}
              podcast={podcast}
              variant={viewMode === 'list' ? 'compact' : 'default'}
              showCategories={true}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPodcasts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Podkaasyo lama helin</p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" className="mt-4">
                Tirtir sifeeyayaasha
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Floating Filter Button */}
      {showFilters && (
        <PodcastFiltersSheet
          podcasts={podcasts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSeries={selectedSeries}
          setSelectedSeries={setSelectedSeries}
          sortBy={sortBy}
          setSortBy={setSortBy}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}
    </div>
  )
}
