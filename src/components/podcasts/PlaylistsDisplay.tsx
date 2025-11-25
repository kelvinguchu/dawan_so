'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Podcast, PodcastPlaylist } from '@/payload-types'
import { ChevronDown, ChevronRight, Clock, Calendar, Headphones, Users, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  formatDuration,
  getPodcastCoverImage,
  formatPeopleInvolved,
  sortPodcastsByPlaylist,
} from '@/utils/podcastUtils'
import { formatTimeAgo } from '@/utils/dateUtils'

interface PlaylistsDisplayProps {
  playlist: PodcastPlaylist
  podcasts: Podcast[]
  defaultExpanded?: boolean
  showAllEpisodes?: boolean
  maxEpisodesPreview?: number
}

export const PlaylistsDisplay: React.FC<PlaylistsDisplayProps> = ({
  playlist,
  podcasts,
  defaultExpanded = false,
  showAllEpisodes = false,
  maxEpisodesPreview = 5,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || showAllEpisodes)
  const [showAll, setShowAll] = useState(showAllEpisodes)

  // Filter and sort episodes for this playlist
  const playlistEpisodes = sortPodcastsByPlaylist(
    podcasts.filter(
      (podcast) =>
        typeof podcast.playlist === 'object' &&
        podcast.playlist?.id === playlist.id &&
        podcast.isPublished,
    ),
  )

  const displayedEpisodes = showAll
    ? playlistEpisodes
    : playlistEpisodes.slice(0, maxEpisodesPreview)
  const hasMoreEpisodes = playlistEpisodes.length > maxEpisodesPreview

  // Calculate playlist stats
  const latestEpisode = playlistEpisodes[playlistEpisodes.length - 1]
  const firstEpisode = playlistEpisodes[0]

  // Get representative cover image (from latest episode or first episode)
  const playlistCoverImage = getPodcastCoverImage(latestEpisode || firstEpisode)

  if (playlistEpisodes.length === 0) {
    return null
  }

  return (
    <div className="relative bg-white rounded-3xl border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#b01c14]/5 via-transparent to-slate-50/30" />

      {/* Playlist Header */}
      <div className="relative">
        {/* Background Image */}
        {playlistCoverImage && (
          <div className="absolute inset-0 h-40">
            <Image
              src={playlistCoverImage}
              alt={playlist.name}
              fill
              className="object-cover opacity-10 blur-sm"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 to-white" />
          </div>
        )}

        <div className="relative p-8 pb-6">
          <div className="flex items-start gap-6">
            {/* Playlist Cover */}
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20">
                {playlistCoverImage ? (
                  <Image
                    src={playlistCoverImage}
                    alt={playlist.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#b01c14]/80 via-[#b01c14]/80 to-[#b01c14]/5 flex items-center justify-center">
                    <Music className="w-10 h-10 text-[#b01c14]" />
                  </div>
                )}
              </div>
            </div>

            {/* Playlist Info */}
            <div className="flex-grow min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-[#b01c14]/80 text-[#b01c14] border-[#b01c14]/80 font-medium">
                      Liiska Podkaas
                    </Badge>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                    <Link
                      href={`/podcasts/playlists/${playlist.slug}`}
                      className="hover:text-[#b01c14] transition-colors duration-300"
                    >
                      {playlist.name}
                    </Link>
                  </h2>
                </div>

                {/* Expand/Collapse Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 h-10 px-4 rounded-full bg-slate-100/80 backdrop-blur-sm text-slate-600 hover:bg-[#b01c14]/80 hover:text-[#b01c14] transition-all duration-300"
                >
                  {isExpanded ? (
                    <>
                      Qari Qaybaha <ChevronDown className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Muuji Qaybaha <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Playlist Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-[#b01c14]" />
                  <span className="font-medium">{playlistEpisodes.length} qaybood</span>
                </div>

                {latestEpisode && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-[#b01c14]" />
                    <span>
                      Ugu dambeeyay:{' '}
                      {formatTimeAgo(latestEpisode.publishedAt || latestEpisode.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      {isExpanded && (
        <div className="relative">
          <div className="px-8 pb-2">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          </div>

          <div className="space-y-2">
            {displayedEpisodes.map((podcast, index) => {
              const coverImageUrl = getPodcastCoverImage(podcast)
              const peopleInvolved = formatPeopleInvolved(podcast.peopleInvolved)

              return (
                <div
                  key={podcast.id}
                  className="group mx-6 rounded-2xl border border-slate-200/60 hover:border-[#b01c14]/30 hover:shadow-lg hover:shadow-[#b01c14]/80 bg-white/60 backdrop-blur-sm transition-all duration-300"
                >
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Episode Number */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#b01c14]/80 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#b01c14]">
                          {podcast.episodeNumber || playlistEpisodes.length - index}
                        </span>
                      </div>

                      {/* Episode Cover */}
                      <div className="flex-shrink-0">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md">
                          {coverImageUrl ? (
                            <Image
                              src={coverImageUrl}
                              alt={podcast.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#b01c14]/80 via-[#b01c14]/80 to-[#b01c14]/5 flex items-center justify-center">
                              <Headphones className="w-6 h-6 text-[#b01c14]" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Episode Info */}
                      <div className="flex-grow min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-semibold text-slate-900 text-base line-clamp-2 leading-tight group-hover:text-[#b01c14] transition-colors duration-300">
                            <Link
                              href={`/podcasts/${podcast.slug}`}
                              className="hover:text-[#b01c14] transition-colors duration-300"
                            >
                              {podcast.title}
                            </Link>
                          </h4>

                          <div className="flex items-center gap-2 flex-shrink-0" />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className="truncate max-w-32">{peopleInvolved}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatTimeAgo(podcast.publishedAt || podcast.createdAt)}</span>
                          </div>

                          {podcast.playCount && podcast.playCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Headphones className="w-3 h-3" />
                              <span>{podcast.playCount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {podcast.description && (
                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {podcast.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Show More/Less Buttons */}
          {hasMoreEpisodes && (
            <div className="p-6 pt-4">
              {showAll ? (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAll(false)}
                    className="text-slate-600 hover:text-[#b01c14] h-11 px-8 rounded-full hover:bg-[#b01c14]/80 transition-all duration-300"
                  >
                    Muuji wax yar
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Button
                    onClick={() => setShowAll(true)}
                    className="bg-[#b01c14] hover:bg-[#b01c14]/90 text-white h-11 px-8 rounded-full shadow-lg hover:shadow-xl hover:shadow-[#b01c14]/30 transition-all duration-300"
                  >
                    Muuji {playlistEpisodes.length - maxEpisodesPreview} qaybood oo dheeraad ah
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
