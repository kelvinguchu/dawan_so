import type { PayloadRequest, Where } from 'payload'
import type { BlogPost, Media, NewsletterCampaign } from '@/payload-types'
import { DateTime } from 'luxon'

export interface DigestArticleSnapshot {
  postId: string
  title: string
  summary: string
  url: string
  views: number
  imageUrl?: string
}

interface LexicalNode {
  type?: string
  text?: string
  children?: LexicalNode[]
}

const MAX_ARTICLES = 5
const SOMALIA_TZ = 'Africa/Mogadishu'

export async function fetchTopDigestArticles({
  req,
  siteUrl,
}: {
  req: PayloadRequest
  siteUrl: string
}): Promise<DigestArticleSnapshot[]> {
  const normalizedSiteUrl = siteUrl.replace(/\/?$/, '')
  const today = DateTime.now().setZone(SOMALIA_TZ)
  const startOfDayIso = today.startOf('day').toUTC().toISO()

  const todaysArticles = await req.payload.find({
    collection: 'blogPosts',
    where: {
      and: [
        { status: { equals: 'published' } },
        { updatedAt: { greater_than_equal: startOfDayIso } },
      ],
    },
    depth: 2,
    sort: '-views',
    limit: MAX_ARTICLES,
    select: {
      id: true,
      name: true,
      slug: true,
      views: true,
      layout: true,
    },
  })

  const articles: BlogPost[] = [...todaysArticles.docs]

  if (articles.length < MAX_ARTICLES) {
    const fallbackWhere: Where[] = [{ status: { equals: 'published' } }]

    if (articles.length > 0) {
      fallbackWhere.push({ id: { not_in: articles.map((article) => article.id) } })
    }

    const fallback = await req.payload.find({
      collection: 'blogPosts',
      where: {
        and: fallbackWhere,
      },
      depth: 2,
      sort: '-views',
      limit: MAX_ARTICLES - articles.length,
      select: {
        id: true,
        name: true,
        slug: true,
        views: true,
        layout: true,
      },
    })

    articles.push(...fallback.docs)
  }

  return articles.slice(0, MAX_ARTICLES).map((article) => {
    const summary = extractSummary(article) || 'Akhriso warbixinta oo dhammaystiran boggayaga.'
    const imageUrl = extractHeroImage(article)

    return {
      postId: article.id,
      title: article.name,
      summary,
      url: `${normalizedSiteUrl}/news/${article.slug}`,
      views: typeof article.views === 'number' ? article.views : 0,
      imageUrl,
    }
  })
}

export function buildDefaultDigestContent(date: DateTime): NewsletterCampaign['content'] {
  return {
    root: {
      type: 'root',
      version: 1,
      indent: 0,
      format: '' as const,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph',
          version: 1,
          indent: 0,
          format: '' as const,
          direction: 'ltr' as const,
          children: [
            {
              type: 'text',
              version: 1,
              text: `Ku soo dhawoow wargeyska caawa ee ${date.toFormat('d LLLL yyyy')}!`,
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
            },
          ],
        },
      ],
    },
  }
}

function extractSummary(article: BlogPost): string | null {
  if (!Array.isArray(article.layout)) return null

  for (const block of article.layout) {
    if (block?.blockType === 'cover' && typeof block?.subheading === 'string' && block.subheading) {
      return block.subheading
    }

    if (block?.blockType === 'richtext' && block?.content?.root?.children) {
      const text = convertLexicalNodesToPlain(block.content.root.children)
      if (text) {
        return truncate(text, 220)
      }
    }
  }

  return null
}

function extractHeroImage(article: BlogPost): string | undefined {
  if (!Array.isArray(article.layout)) return undefined

  for (const block of article.layout) {
    if (block?.blockType === 'cover' && block?.image && typeof block.image === 'object') {
      const maybeMedia = block.image as Media | { url?: string }
      if (typeof maybeMedia?.url === 'string') {
        return maybeMedia.url
      }
    }
  }

  return undefined
}

function convertLexicalNodesToPlain(nodes: LexicalNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return node.text ?? ''
      }

      if (node.children) {
        return convertLexicalNodesToPlain(node.children)
      }

      return ''
    })
    .join(' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength).trim()}…`
}
