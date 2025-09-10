import { Podcast, Media, PodcastSery } from '@/payload-types'

export const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds || seconds <= 0) return '0s'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  const parts: string[] = []

  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`)

  return parts.join(' ')
}

export const formatDurationClock = (seconds: number | null | undefined): string => {
  if (!seconds || seconds <= 0) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const getPodcastDisplayTitle = (podcast: Podcast): string => {
  if (!podcast.series) return podcast.title

  const seriesName =
    typeof podcast.series === 'string' ? '' : (podcast.series as PodcastSery)?.name || ''
  const episode = podcast.episodeNumber

  const parts: string[] = []
  if (seriesName) parts.push(seriesName)
  if (episode) parts.push(`Ep. ${episode}`)

  if (parts.length === 0) return podcast.title

  return `${parts.join(' ')}: ${podcast.title}`
}

export const getPodcastSeriesLabel = (podcast: Podcast): string => {
  if (!podcast.series) return ''
  const episode = podcast.episodeNumber
  if (episode) return `Ep. ${episode}`
  return ''
}

export const getPodcastCoverImage = (podcast: Podcast): string | null => {
  if (!podcast.coverImage) return null

  if (typeof podcast.coverImage === 'string') return null

  const media = podcast.coverImage as Media
  return media.url || null
}

export const getPodcastAudioUrl = (podcast: Podcast): string | null => {
  if (!podcast.audioFile) return null

  if (typeof podcast.audioFile === 'string') return null

  const media = podcast.audioFile as Media
  return media.url || null
}

export const formatPeopleInvolved = (peopleInvolved: Podcast['peopleInvolved']): string => {
  if (!peopleInvolved || peopleInvolved.length === 0) {
    return 'Unknown'
  }

  const roleGroups: Record<string, string[]> = {}

  peopleInvolved.forEach((person) => {
    const role = formatPersonRole(person.role)
    if (!roleGroups[role]) {
      roleGroups[role] = []
    }
    roleGroups[role].push(person.name)
  })

  const roleStrings = Object.entries(roleGroups).map(([role, names]) => {
    if (names.length === 1) {
      return `${names[0]} (${role})`
    }
    return `${names.join(', ')} (${role}s)`
  })

  return roleStrings.join(' • ')
}

export const getPodcastHosts = (peopleInvolved: Podcast['peopleInvolved']): string[] => {
  if (!peopleInvolved || peopleInvolved.length === 0) {
    return []
  }

  return peopleInvolved
    .filter((person) => person.role === 'host' || person.role === 'co-host')
    .map((person) => person.name)
}

export const formatPersonRole = (role: string): string => {
  const roleMapping: Record<string, string> = {
    host: 'Host',
    'co-host': 'Co-Host',
    guest: 'Guest',
    interviewer: 'Interviewer',
    producer: 'Producer',
    editor: 'Editor',
    'sound-engineer': 'Sound Engineer',
    moderator: 'Moderator',
  }

  return roleMapping[role] || role
}

export const getPodcastExcerpt = (podcast: Podcast, maxLength: number = 150): string => {
  if (!podcast.description) return ''

  if (podcast.description.length <= maxLength) {
    return podcast.description
  }

  const truncated = podcast.description.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...'
  }

  return truncated + '...'
}

export const groupPodcastsBySeries = (podcasts: Podcast[]): Record<string, Podcast[]> => {
  const groups: Record<string, Podcast[]> = {
    Standalone: [],
  }

  podcasts.forEach((podcast) => {
    if (podcast.series) {
      const seriesName =
        typeof podcast.series === 'string'
          ? 'Unknown Series'
          : (podcast.series as PodcastSery)?.name || 'Unknown Series'
      if (!groups[seriesName]) {
        groups[seriesName] = []
      }
      groups[seriesName].push(podcast)
    } else {
      groups['Standalone'].push(podcast)
    }
  })

  return groups
}

export const sortPodcastsBySeries = (podcasts: Podcast[]): Podcast[] => {
  return [...podcasts].sort((a, b) => {
    const episodeA = a.episodeNumber || 0
    const episodeB = b.episodeNumber || 0

    if (episodeA !== episodeB) {
      return episodeA - episodeB
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export const isPodcastInSeries = (podcast: Podcast): boolean => {
  return Boolean(podcast.series)
}

export const getUniqueSeriesNames = (podcasts: Podcast[]): { id: string; name: string }[] => {
  const seriesMap = new Map<string, { id: string; name: string }>()

  podcasts.forEach((podcast) => {
    if (podcast.series && typeof podcast.series === 'object') {
      const series = podcast.series as PodcastSery
      if (series.id && series.name) {
        seriesMap.set(series.id, { id: series.id, name: series.name })
      }
    }
  })

  return Array.from(seriesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}
