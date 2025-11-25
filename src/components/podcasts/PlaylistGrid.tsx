'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Music, PlayCircle } from 'lucide-react'
import { PlaylistWithCount } from '@/lib/podcast-actions'

interface PlaylistGridProps {
  playlists: PlaylistWithCount[]
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists }) => {
  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Music className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Liisaska lama helin</h3>
        <p className="text-gray-500 mt-2">Hadda ma jiraan liisas podkaas oo la heli karo.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {playlists.map((playlist) => {
        const imageUrl =
          typeof playlist.image === 'object' && playlist.image?.url ? playlist.image.url : null

        return (
          <Link
            key={playlist.id}
            href={`/podcasts?playlist=${playlist.id}`}
            className="group flex items-center bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-slate-100">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={playlist.name}
                  fill
                  sizes="(max-width: 640px) 80px, 96px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <Music className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>

            <div className="flex flex-col justify-center p-3 min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#b01c14] transition-colors line-clamp-2 leading-tight">
                {playlist.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                <PlayCircle className="w-3 h-3" />
                <span>
                  {playlist.count} {playlist.count === 1 ? 'qayb' : 'qaybood'}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
