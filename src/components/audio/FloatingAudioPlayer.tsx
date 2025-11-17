'use client'

import React, { useEffect, useState } from 'react'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import {
  X,
  Minimize2,
  Maximize2,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import Link from 'next/link'

const isKnown = (value?: string | null): value is string => {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return normalized !== '' && normalized !== 'unknown'
}

const formatTime = (time: number): string => {
  if (Number.isNaN(time)) return '0:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const MinimizedPlayer: React.FC<{
  isActive: boolean
  togglePlayPause: () => void
  toggleMinimize: () => void
}> = ({ isActive, togglePlayPause, toggleMinimize }) => (
  <div className="w-full h-full flex items-center justify-center">
    <button
      type="button"
      onClick={togglePlayPause}
      className="w-12 h-12 flex items-center justify-center bg-[#b01c14] hover:bg-[#8e140f] text-white rounded-lg transition-colors"
      aria-label={isActive ? 'Hakadi cod' : 'Bilow cod'}
    >
      {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
    </button>
    <button
      type="button"
      onClick={toggleMinimize}
      className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
      aria-label="Kordhi ciyaaryahanka"
    >
      <Maximize2 className="w-3 h-3" />
    </button>
  </div>
)

type PlayerControlsProps = {
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isActive: boolean
  togglePlayPause: () => void
  toggleMute: () => void
  seekTo: (time: number) => void
  setVolume: (value: number) => void
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentTime,
  duration,
  volume,
  isMuted,
  isActive,
  togglePlayPause,
  toggleMute,
  seekTo,
  setVolume,
}) => {
  const handleProgressClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seekTo(percent * duration)
  }

  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      seekTo(Math.max(0, currentTime - 5))
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      seekTo(Math.min(duration, currentTime + 5))
    }
  }

  const handleVolumeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    setVolume(percent)
  }

  const handleVolumeKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      setVolume(Math.max(0, volume - 0.1))
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      setVolume(Math.min(1, volume + 0.1))
    }
  }

  return (
    <>
      <div className="mb-3">
        <button
          type="button"
          aria-label="Ka raadi codkan"
          className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer p-0"
          onClick={handleProgressClick}
          onKeyDown={handleProgressKeyDown}
        >
          <div
            className="h-full bg-[#b01c14] rounded-full transition-all duration-150"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </button>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => seekTo(Math.max(0, currentTime - 15))}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
            aria-label="U bood 15 ilbiriqsi hore"
          >
            <SkipBack className="w-4 h-4 text-gray-600" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className="w-10 h-10 flex items-center justify-center bg-[#b01c14] hover:bg-[#8e140f] text-white rounded-full transition-colors"
            aria-label={isActive ? 'Hakadi codka' : 'Bilow codka'}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => seekTo(Math.min(duration, currentTime + 15))}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
            aria-label="U bood 15 ilbiriqsi dambe"
          >
            <SkipForward className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleMute}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
            aria-label={isMuted || volume === 0 ? 'Daar codka' : 'Aamus codka'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-gray-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            type="button"
            aria-label="Hagaaji codka"
            className="relative w-16 h-2 bg-gray-200 rounded-full cursor-pointer p-0"
            onClick={handleVolumeClick}
            onKeyDown={handleVolumeKeyDown}
          >
            <div
              className="h-full bg-[#b01c14] rounded-full transition-all duration-150"
              style={{ width: `${volume * 100}%` }}
            />
          </button>
        </div>
      </div>
    </>
  )
}

type FullPlayerProps = {
  isActive: boolean
  displayTitle?: string
  displayArticleSlug?: string
  toggleMinimize: () => void
  hidePlayer: () => void
} & PlayerControlsProps

const FullPlayer: React.FC<FullPlayerProps> = ({
  isActive,
  displayTitle,
  displayArticleSlug,
  toggleMinimize,
  hidePlayer,
  ...controlProps
}) => (
  <div className="p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <Music className="w-4 h-4 text-[#b01c14]" />
        <span className="text-xs text-gray-500 font-medium">Hadda Socda</span>
      </div>
      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={toggleMinimize}
          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          aria-label="Yaree ciyaaryahanka"
        >
          <Minimize2 className="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={hidePlayer}
          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          aria-label="Xir ciyaaryahanka"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>

    <div className="mb-3">
      {displayTitle && (
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">
          {displayTitle}
        </h3>
      )}
      {displayArticleSlug && (
        <Link
          href={`/news/${displayArticleSlug}`}
          className="text-xs text-[#b01c14] hover:text-[#8e140f] mt-1 inline-block"
        >
          Akhri maqaalka →
        </Link>
      )}
    </div>

    <PlayerControls {...controlProps} isActive={isActive} />
  </div>
)

export const FloatingAudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlayerVisible,
    isMinimized,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    toggleMinimize,
    hidePlayer,
    shouldAutoPlayRef,
  } = useAudioPlayer()

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !currentTrack || !isPlayerVisible) {
    return null
  }

  const isActive = isPlaying || shouldAutoPlayRef.current
  const displayTitle = isKnown(currentTrack.title) ? currentTrack.title : undefined
  const displayArticleSlug = isKnown(currentTrack.articleSlug)
    ? currentTrack.articleSlug
    : undefined

  const sharedControls: PlayerControlsProps = {
    currentTime,
    duration,
    volume,
    isMuted,
    isActive,
    togglePlayPause,
    toggleMute,
    seekTo,
    setVolume,
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-16 h-16' : 'w-80 sm:w-96'
      }`}
    >
      {isMinimized ? (
        <MinimizedPlayer
          isActive={isActive}
          togglePlayPause={togglePlayPause}
          toggleMinimize={toggleMinimize}
        />
      ) : (
        <FullPlayer
          {...sharedControls}
          displayTitle={displayTitle}
          displayArticleSlug={displayArticleSlug}
          toggleMinimize={toggleMinimize}
          hidePlayer={hidePlayer}
        />
      )}
    </div>
  )
}
