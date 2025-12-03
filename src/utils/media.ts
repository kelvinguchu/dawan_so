import type { Media } from '@/payload-types'

export type MediaLike = Media | string | null | undefined

const getUrlFromSizes = (media: Media, size?: keyof NonNullable<Media['sizes']>) => {
  if (!size) {
    return media.url ?? null
  }
  return media.sizes?.[size]?.url ?? media.url ?? null
}

export const getMediaUrl = (
  media: MediaLike,
  size?: keyof NonNullable<Media['sizes']>,
): string | null => {
  if (!media || typeof media === 'string') {
    return null
  }

  return getUrlFromSizes(media, size)
}

export const getMediaAlt = (media: MediaLike, fallback?: string): string => {
  if (!media || typeof media === 'string') {
    return fallback ?? ''
  }

  return media.alt || media.caption || fallback || ''
}

export const getMediaDimensions = (
  media: MediaLike,
): { width?: number | null; height?: number | null } => {
  if (!media || typeof media === 'string') {
    return {}
  }

  return {
    width: media.width ?? undefined,
    height: media.height ?? undefined,
  }
}
