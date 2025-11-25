'use client'

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import type Hls from 'hls.js'

export interface AudioTrack {
  id: string
  title: string
  artist?: string
  src: string
  duration?: number
  thumbnail?: string
  articleSlug?: string
}

interface AudioPlayerContextType {
  currentTrack: AudioTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isPlayerVisible: boolean
  isMinimized: boolean
  setCurrentTrack: (track: AudioTrack, autoPlay?: boolean) => void
  play: () => void
  pause: () => void
  togglePlayPause: () => void
  seekTo: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  showPlayer: () => void
  hidePlayer: () => void
  toggleMinimize: () => void
  prefetchTrack: (track: AudioTrack) => void
  audioRef: React.RefObject<HTMLAudioElement | null>
  shouldAutoPlayRef: React.RefObject<boolean>
  updateCurrentTime: (time: number) => void
  updateDuration: (duration: number) => void
  setIsPlaying: (playing: boolean) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider')
  }
  return context
}

interface AudioPlayerProviderProps {
  children: ReactNode
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const [currentTrackState, setCurrentTrackState] = useState<AudioTrack | null>(null)
  const [isPlayingState, setIsPlayingState] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volumeState, setVolumeState] = useState(1)
  const [isMutedState, setIsMutedState] = useState(false)
  const [isPlayerVisible, setIsPlayerVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const shouldAutoPlayRef = useRef<boolean>(false)
  const hasCountedPlayRef = useRef<boolean>(false)
  const [autoPlayPending, setAutoPlayPending] = useState(false)
  const prefetchedSourcesRef = useRef<Set<string>>(new Set())
  const hlsRef = useRef<Hls | null>(null)

  const currentTrack = currentTrackState
  const isPlaying = isPlayingState
  const volume = volumeState
  const isMuted = isMutedState

  const prefetchTrack = useCallback((track: AudioTrack) => {
    if (!track?.src || prefetchedSourcesRef.current.has(track.src)) {
      return
    }

    prefetchedSourcesRef.current.add(track.src)

    if (typeof document !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = track.src
      link.crossOrigin = 'anonymous'
      link.dataset.prefetch = 'audio-player'
      link.addEventListener('error', () => {
        prefetchedSourcesRef.current.delete(track.src)
        link.remove()
      })
      document.head.appendChild(link)
    }

    fetch(track.src, {
      headers: {
        Range: 'bytes=0-65535',
      },
      cache: 'force-cache',
    }).catch(() => {
      prefetchedSourcesRef.current.delete(track.src)
    })
  }, [])

  const setCurrentTrack = useCallback(
    (track: AudioTrack, autoPlay?: boolean) => {
      if (track) {
        prefetchTrack(track)
      }
      setCurrentTrackState(track)
      setCurrentTime(0)
      setDuration(0)
      shouldAutoPlayRef.current = !!autoPlay
      hasCountedPlayRef.current = false
      setAutoPlayPending(!!autoPlay)
      if (!isPlayerVisible) {
        setIsPlayerVisible(true)
      }
      setIsMinimized(false)
    },
    [isPlayerVisible, prefetchTrack],
  )

  const play = useCallback(() => {
    if (audioRef.current && currentTrack) {
      const playPromise = audioRef.current.play()
      if (playPromise instanceof Promise) {
        playPromise.catch((error) => {
          console.error('Error playing audio:', error)
        })
      }
    }
  }, [currentTrack])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlayingState(false)
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const setVolume = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume))
      setVolumeState(clampedVolume)
      if (audioRef.current) {
        audioRef.current.volume = clampedVolume
        if (audioRef.current.muted && clampedVolume > 0) {
          audioRef.current.muted = false
        }
      }
      if (clampedVolume > 0 && isMuted) {
        setIsMutedState(false)
      }
    },
    [isMuted],
  )

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMutedState = !isMuted
      setIsMutedState(newMutedState)
      audioRef.current.muted = newMutedState
    }
  }, [isMuted])

  const showPlayer = useCallback(() => {
    setIsPlayerVisible(true)
  }, [])

  const hidePlayer = useCallback(() => {
    setIsPlayerVisible(false)
    pause()
  }, [pause])

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev)
  }, [])

  const updateCurrentTime = useCallback((time: number) => {
    setCurrentTime(time)
  }, [])

  const updateDuration = useCallback((dur: number) => {
    setDuration(dur)
  }, [])

  const setIsPlaying = useCallback((playing: boolean) => {
    setIsPlayingState(playing)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      return
    }

    const currentSrc = currentTrack.src
    const isHlsSource = /\.m3u8($|\?)/i.test(currentSrc)

    const destroyHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }

    const applyNativeSource = () => {
      destroyHls()
      if (audio.src !== currentSrc) {
        audio.src = currentSrc
        audio.load()
        audio.currentTime = 0
      }
    }

    const attemptPlay = () => {
      if (!shouldAutoPlayRef.current) {
        return
      }

      const finalizeAutoPlay = () => {
        shouldAutoPlayRef.current = false
        setAutoPlayPending(false)
      }

      const playPromise = audio.play()
      if (playPromise instanceof Promise) {
        playPromise
          .catch((error) => {
            if (error instanceof DOMException && error.name === 'NotAllowedError') {
              console.debug('Autoplay blocked, waiting for user interaction to resume.')
            } else {
              console.error('Playback failed:', error)
            }
          })
          .finally(finalizeAutoPlay)
      } else {
        finalizeAutoPlay()
      }
    }

    if (isHlsSource && !audio.canPlayType('application/vnd.apple.mpegurl')) {
      let cancelled = false
      let timeout: ReturnType<typeof globalThis.setTimeout> | undefined

      const setupHls = async () => {
        try {
          const { default: Hls } = await import('hls.js')
          if (cancelled) return

          if (!Hls.isSupported()) {
            console.warn('HLS.js not supported, falling back to native playback.')
            applyNativeSource()
            if (autoPlayPending) {
              timeout = globalThis.setTimeout(attemptPlay, 50)
            }
            shouldAutoPlayRef.current = false
            setAutoPlayPending(false)
            return
          }

          destroyHls()
          const hls = new Hls({ enableWorker: true, backBufferLength: 120 })
          hlsRef.current = hls
          hls.attachMedia(audio)
          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            if (!cancelled) {
              hls.loadSource(currentSrc)
            }
          })
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.currentTime = 0
            attemptPlay()
          })
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data?.fatal) {
              console.error('Fatal HLS error', data)
              destroyHls()
            }
          })
        } catch (err) {
          if (!cancelled) {
            console.error('Failed to initialize HLS.js', err)
            applyNativeSource()
            attemptPlay()
          }
        }
      }

      setupHls()

      return () => {
        cancelled = true
        if (timeout) {
          globalThis.clearTimeout(timeout)
        }
        destroyHls()
      }
    }

    applyNativeSource()

    if (autoPlayPending) {
      const timeout = globalThis.setTimeout(attemptPlay, 50)
      return () => {
        globalThis.clearTimeout(timeout)
        destroyHls()
      }
    }

    shouldAutoPlayRef.current = false
    setAutoPlayPending(false)

    return () => {
      destroyHls()
    }
  }, [currentTrack, autoPlayPending, setIsPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  const value = useMemo<AudioPlayerContextType>(
    () => ({
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isPlayerVisible,
      isMinimized,
      setCurrentTrack,
      play,
      pause,
      togglePlayPause,
      seekTo,
      setVolume,
      toggleMute,
      showPlayer,
      hidePlayer,
      toggleMinimize,
      prefetchTrack,
      audioRef,
      shouldAutoPlayRef,
      updateCurrentTime,
      updateDuration,
      setIsPlaying,
    }),
    [
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isPlayerVisible,
      isMinimized,
      setCurrentTrack,
      play,
      pause,
      togglePlayPause,
      seekTo,
      setVolume,
      toggleMute,
      showPlayer,
      hidePlayer,
      toggleMinimize,
      prefetchTrack,
      audioRef,
      shouldAutoPlayRef,
      updateCurrentTime,
      updateDuration,
      setIsPlaying,
    ],
  )

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="auto"
        aria-hidden
        tabIndex={-1}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            updateDuration(audioRef.current.duration)
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const time = audioRef.current.currentTime
            updateCurrentTime(time)

            if (time > 10 && !hasCountedPlayRef.current && currentTrack?.id) {
              hasCountedPlayRef.current = true
              if (currentTrack.id.startsWith('podcast-')) {
                const podcastId = currentTrack.id.replace('podcast-', '')
                fetch(`/api/podcasts/${podcastId}/increment-views`, { method: 'POST' }).catch(
                  (err) => console.error('Failed to increment podcast play count', err),
                )
              }
            }
          }
        }}
      >
        <track kind="captions" label="Hidden audio" src="data:text/vtt,%20" default />
      </audio>
    </AudioPlayerContext.Provider>
  )
}
