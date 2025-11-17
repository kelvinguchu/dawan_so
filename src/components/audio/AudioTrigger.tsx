'use client'

import React, { useEffect } from 'react'
import { useAudioPlayer, AudioTrack } from '@/contexts/AudioPlayerContext'
import { Play, Pause } from 'lucide-react'

type TriggerSize = 'sm' | 'md' | 'lg'

const BUTTON_SIZE_CLASSES: Record<TriggerSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-2 rounded-full',
  md: 'px-4 py-2 text-sm gap-2 rounded-full',
  lg: 'px-5 py-2.5 text-base gap-3 rounded-full',
}

const ICON_SIZE_CLASSES: Record<TriggerSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

interface AudioTriggerProps {
  track: AudioTrack
  size?: TriggerSize
  className?: string
  children?: React.ReactNode
  showTitle?: boolean
}

export const AudioTrigger: React.FC<AudioTriggerProps> = ({
  track,
  size = 'md',
  className = '',
  children,
  showTitle = false,
}) => {
  const {
    currentTrack,
    isPlaying,
    isPlayerVisible,
    setCurrentTrack,
    togglePlayPause,
    showPlayer,
    prefetchTrack,
  } = useAudioPlayer()

  useEffect(() => {
    prefetchTrack(track)
  }, [prefetchTrack, track])

  const isCurrentTrack = currentTrack?.id === track.id
  const isCurrentlyPlaying = isCurrentTrack && isPlaying

  const handleClick = () => {
    if (isCurrentTrack) {
      if (!isPlayerVisible) {
        showPlayer()
      }
      togglePlayPause()
    } else {
      setCurrentTrack(track, true)
      showPlayer()
    }
  }

  let fallbackLabel: React.ReactNode = 'Dhageyso'
  if (showTitle) {
    fallbackLabel = track.title
  } else if (isCurrentlyPlaying) {
    fallbackLabel = 'Hakadi'
  }

  const label = children ?? fallbackLabel

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-medium bg-[#b01c14] text-white hover:bg-[#8e140f] transition-colors ${BUTTON_SIZE_CLASSES[size]} ${className}`}
      title={isCurrentlyPlaying ? 'Hakadi maqal' : 'Bilow maqal'}
    >
      {isCurrentlyPlaying ? (
        <Pause className={ICON_SIZE_CLASSES[size]} />
      ) : (
        <Play className={ICON_SIZE_CLASSES[size]} />
      )}
      <span>{label}</span>
    </button>
  )
}
