import { BlogPost, Media, User } from '@/payload-types'

type ImageSize = 'thumbnail' | 'card' | 'tablet'

const isMedia = (value: unknown): value is Media => {
  return Boolean(value) && typeof value === 'object' && 'url' in (value as Record<string, unknown>)
}

const resolveMediaUrl = (image: unknown, size?: ImageSize): string | null => {
  if (!isMedia(image)) {
    return null
  }

  if (size) {
    return image.sizes?.[size]?.url ?? image.url ?? null
  }

  return image.url ?? null
}

export const getPostImageFromLayout = (
  layout: BlogPost['layout'],
  size?: ImageSize,
): string | null => {
  if (!layout) {
    return null
  }

  let fallbackUrl: string | null = null

  for (const block of layout) {
    if (!block || (block.blockType !== 'cover' && block.blockType !== 'image')) {
      continue
    }

    const imageUrl = resolveMediaUrl(block.image, size)
    if (!imageUrl) {
      continue
    }

    if (block.blockType === 'cover') {
      return imageUrl
    }

    if (!fallbackUrl) {
      fallbackUrl = imageUrl
    }
  }

  return fallbackUrl
}

interface GetPostExcerptOptions {
  prioritizeCoverSubheading?: boolean
  maxLength?: number
}

const DEFAULT_EXCERPT_OPTIONS: Required<GetPostExcerptOptions> = {
  prioritizeCoverSubheading: true,
  maxLength: 180,
}

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

const findCoverSubheading = (layout: BlogPost['layout']): string | null => {
  if (!layout) {
    return null
  }

  for (const block of layout) {
    if (block.blockType === 'cover' && typeof block.subheading === 'string') {
      return block.subheading
    }
  }

  return null
}

const findFirstRichText = (layout: BlogPost['layout']): string | null => {
  if (!layout) {
    return null
  }

  for (const block of layout) {
    if (block.blockType === 'richtext' && 'content' in block) {
      const textNode = block.content?.root?.children?.[0]
      if (textNode && typeof textNode.text === 'string') {
        return textNode.text
      }
    }
  }

  return null
}

export const getPostExcerpt = (post: BlogPost, options?: GetPostExcerptOptions): string => {
  if (!post.layout) {
    return ''
  }

  const { prioritizeCoverSubheading, maxLength } = {
    ...DEFAULT_EXCERPT_OPTIONS,
    ...options,
  }

  if (prioritizeCoverSubheading) {
    const coverExcerpt = findCoverSubheading(post.layout)
    if (coverExcerpt) {
      return truncateText(coverExcerpt, maxLength)
    }
  }

  const richTextExcerpt = findFirstRichText(post.layout)
  return richTextExcerpt ? truncateText(richTextExcerpt, maxLength) : ''
}

const isUserAuthor = (author: BlogPost['author']): author is User => {
  return Boolean(author) && typeof author === 'object'
}

const getUserFromAuthor = (author: BlogPost['author']): User | null => {
  return isUserAuthor(author) ? author : null
}

export const getAuthorDisplayName = (author: BlogPost['author']): string => {
  const user = getUserFromAuthor(author)
  if (!user) {
    return 'Unknown Author'
  }

  return user.name || user.email?.split('@')[0] || 'Unknown Author'
}

export const getAuthorName = (author: BlogPost['author']): string => {
  const user = getUserFromAuthor(author)
  return user?.name || 'Unknown Author'
}

const CONTENT_CREATOR_ROLES = new Set(['analyst', 'columnist', 'reporter', 'contributor'])

export const getAuthorRole = (author: BlogPost['author']): string => {
  const user = getUserFromAuthor(author)
  if (!user?.roles?.length) {
    return 'Contributor'
  }

  const contentCreatorRole = user.roles.find((role) => CONTENT_CREATOR_ROLES.has(role))
  const primaryRole =
    contentCreatorRole || user.roles.find((role) => role !== 'user') || user.roles[0]

  switch (primaryRole) {
    case 'admin':
      return 'Admin'
    case 'analyst':
      return 'Analyst'
    case 'columnist':
      return 'Columnist'
    case 'reporter':
      return 'Reporter'
    case 'contributor':
      return 'Contributor'
    default:
      return 'Contributor'
  }
}

export const getPostAuthorName = (post: BlogPost): string => {
  if (post.useManualReporter && post.manualReporter?.name) {
    return post.manualReporter.name
  }

  return getAuthorName(post.author)
}

export const getPostAuthorRole = (post: BlogPost): string => {
  if (post.useManualReporter && post.manualReporter) {
    if (post.manualReporter.useCustomRole && post.manualReporter.customRole) {
      return post.manualReporter.customRole
    }

    if (post.manualReporter.role) {
      const roleMapping: Record<string, string> = {
        reporter: 'Reporter',
        correspondent: 'Correspondent',
        freelance: 'Freelance Journalist',
        contributor: 'Contributing Writer',
        'special-correspondent': 'Special Correspondent',
        'field-reporter': 'Field Reporter',
        investigative: 'Investigative Journalist',
        analyst: 'News Analyst',
        'senior-correspondent': 'Senior Correspondent',
        'bureau-chief': 'Bureau Chief',
      }

      return roleMapping[post.manualReporter.role] || post.manualReporter.role
    }
  }

  return getAuthorRole(post.author)
}

export const getPostAuthorDisplayName = (post: BlogPost): string => {
  if (post.useManualReporter && post.manualReporter?.name) {
    return post.manualReporter.name
  }

  return getAuthorDisplayName(post.author)
}

export const getReporterUrl = (post: BlogPost): string => {
  const reporterName = getPostAuthorName(post)
  return `/news?reporter=${encodeURIComponent(reporterName)}`
}
