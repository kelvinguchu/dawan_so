import { BlogPost, Media } from '@/payload-types'
import siteConfig from '@/app/shared-metadata'

export function escapeXml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function formatRSSDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toUTCString()
}

export function extractTextFromLayout(layout: BlogPost['layout']): string {
  if (!layout || !Array.isArray(layout)) return ''

  let textContent = ''

  for (const block of layout) {
    switch (block.blockType) {
      case 'richtext':
        if (block.content?.root?.children) {
          textContent += extractTextFromLexical(block.content.root.children)
        }
        break
      case 'cover':
        if (block.subheading) {
          textContent += block.subheading + ' '
        }
        break
      default:
        break
    }
  }

  return textContent.trim()
}

function extractTextFromLexical(children: unknown[]): string {
  if (!children || !Array.isArray(children)) return ''

  let text = ''
  for (const child of children) {
    if (typeof child === 'object' && child !== null) {
      const node = child as Record<string, unknown>
      if (node.type === 'text' && typeof node.text === 'string') {
        text += node.text
      } else if (Array.isArray(node.children)) {
        text += extractTextFromLexical(node.children)
      }

      if (
        node.type === 'paragraph' ||
        (typeof node.type === 'string' && node.type.startsWith('heading'))
      ) {
        text += ' '
      }
    }
  }
  return text
}

export function generateRSSDescription(post: BlogPost, maxLength: number = 300): string {
  let description = ''

  if (post.layout && post.layout.length > 0) {
    description = extractTextFromLayout(post.layout)
  }

  if (!description.trim()) {
    description = post.name || 'Read more on Dawan TV'
  }

  if (description.length > maxLength) {
    description = description.substring(0, maxLength).trim()
    const lastSpace = description.lastIndexOf(' ')
    if (lastSpace > maxLength * 0.8) {
      description = description.substring(0, lastSpace)
    }
    description += '...'
  }

  return description.trim()
}

export function getFeaturedImageUrl(post: BlogPost): string | null {
  if (!post.layout || !Array.isArray(post.layout)) return null

  for (const block of post.layout) {
    if (block.blockType === 'cover' && block.image) {
      const media = typeof block.image === 'string' ? null : (block.image as Media)
      if (media?.url) {
        return media.url.startsWith('http') ? media.url : `${siteConfig.url}${media.url}`
      }
    }
  }

  return null
}

export function getRSSCategories(post: BlogPost): string[] {
  if (!post.categories || !Array.isArray(post.categories)) return []

  return post.categories
    .map((cat) => {
      if (typeof cat === 'string') return null
      return cat.name || null
    })
    .filter((name): name is string => name !== null)
}

export function generateRSSItem(post: BlogPost): string {
  const title = escapeXml(post.name || 'Untitled')
  const link = `${siteConfig.url}/news/${post.slug}`
  const description = escapeXml(generateRSSDescription(post))
  const pubDate = formatRSSDate(post.createdAt)
  const guid = `${siteConfig.url}/news/${post.slug}`
  const categories = getRSSCategories(post)
  const featuredImage = getFeaturedImageUrl(post)

  let item = `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${guid}</guid>`

  categories.forEach((category) => {
    item += `\n      <category>${escapeXml(category)}</category>`
  })

  if (featuredImage) {
    item += `\n      <enclosure url="${featuredImage}" type="image/jpeg" length="0" />`
  }

  item += `\n    </item>`

  return item
}

export function generateRSSFeed(posts: BlogPost[]): string {
  const title = escapeXml(siteConfig.name)
  const description = escapeXml(siteConfig.description)
  const link = siteConfig.url
  const lastBuildDate = formatRSSDate(new Date())
  const language = 'en-us'

  const items = posts.map((post) => generateRSSItem(post)).join('')

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <description>${description}</description>
    <link>${link}</link>
    <atom:link href="${link}/rss.xml" rel="self" type="application/rss+xml" />
    <language>${language}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Next.js RSS Generator</generator>
    <webMaster>info@dawan.so (Dawan TV)</webMaster>
    <managingEditor>info@dawan.so (Dawan TV)</managingEditor>
    <copyright>Copyright ${new Date().getFullYear()} ${siteConfig.name}</copyright>
    <image>
      <url>${link}/logo.png</url>
      <title>${title}</title>
      <link>${link}</link>
      <width>144</width>
      <height>144</height>
    </image>${items}
  </channel>
</rss>`
}
