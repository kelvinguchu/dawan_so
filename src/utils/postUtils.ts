import { BlogPost, Media, User } from '@/payload-types'

type ImageSize = 'thumbnail' | 'card' | 'tablet'

export const getPostImageFromLayout = (  layout: BlogPost['layout'],  size?: ImageSize,): string | null => {
  if (!layout) return null
  for (const block of layout) {
    if (block.blockType === 'cover' && block.image) {
      const media = typeof block.image === 'string' ? null : (block.image as Media)
      if (!media) return null
      return size ? media.sizes?.[size]?.url ?? media.url ?? null : media.url ?? null
    }
  }
  for (const block of layout) {
    if (block.blockType === 'image' && block.image) {
      const media = typeof block.image === 'string' ? null : (block.image as Media)
      if (!media) return null
      return size ? media.sizes?.[size]?.url ?? media.url ?? null : media.url ?? null
    }
  }
  return null
}

interface GetPostExcerptOptions {
  prioritizeCoverSubheading?: boolean
  maxLength?: number
}

export const getPostExcerpt = (
  post: BlogPost,
  options: GetPostExcerptOptions = { prioritizeCoverSubheading: true, maxLength: 180 },
): string => {
  const { prioritizeCoverSubheading = true, maxLength = 180 } = options
  if (!post.layout) return ''

  if (prioritizeCoverSubheading) {
    for (const block of post.layout) {
      if (block.blockType === 'cover' && block.subheading) {
        const subheading = block.subheading as string
        return subheading.length > maxLength
          ? `${subheading.substring(0, maxLength)}...`
          : subheading
      }
    }
  }

  for (const block of post.layout) {
    if (block.blockType === 'richtext' && block.content?.root?.children?.[0]?.text) {
      const text = block.content.root.children[0].text as string
      return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
    }
  }

  return ''
}

export const getAuthorDisplayName = (author: BlogPost['author']): string => {
  if (!author) return 'Unknown Author'

  if (typeof author === 'object' && author !== null) {
    const user = author as User
    return user.name || user.email?.split('@')[0] || 'Unknown Author'
  }
  return 'Unknown Author'
}

export const getAuthorName = (author: BlogPost['author']): string => {
  if (!author) return 'Unknown Author'

  if (typeof author === 'object' && author !== null) {
    const user = author as User
    return user.name || 'Unknown Author'
  }
  return 'Unknown Author'
}

export const getAuthorRole = (author: BlogPost['author']): string => {
  if (!author) return 'Contributor'

  if (typeof author === 'object' && author !== null) {
    const user = author as User
    if (user.roles && user.roles.length > 0) {
      const contentCreatorRoles = ['analyst', 'columnist', 'reporter', 'contributor']
      const contentCreatorRole = user.roles.find((role) => contentCreatorRoles.includes(role))

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
  }
  return 'Contributor'
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
