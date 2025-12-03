import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { siteConfig } from '@/app/shared-metadata'
import type { Media } from '@/payload-types'

const COLLECTION_SLUG = 'dawanpediaEntries' as const

const escapeXml = (unsafe: string): string =>
  unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const toAbsoluteUrl = (value: string): string => {
  try {
    return new URL(value, siteConfig.url).toString()
  } catch (error) {
    console.warn('Failed to normalise sitemap URL:', value, error)
    return value
  }
}

// Temporary type until payload-types.ts is regenerated
interface DawanpediaEntry {
  id: string
  name: string
  slug: string
  entryType: 'person' | 'business'
  status?: 'draft' | 'review' | 'published'
  primaryImage?: Media | string | null
  publishedDate?: string | null
  createdAt?: string
  updatedAt?: string
}

type EntryWithImage = DawanpediaEntry & {
  primaryImage?: Media | string | null
}

export async function GET() {
  const payload = await getPayload({ config })

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (payload as any).find({
      collection: COLLECTION_SLUG,
      where: {
        and: [
          { status: { equals: 'published' } },
          {
            or: [{ entryType: { equals: 'person' } }, { entryType: { equals: 'business' } }],
          },
        ],
      },
      depth: 1,
      limit: 5000,
      pagination: false,
      sort: '-updatedAt',
    })

    const docs = response.docs as EntryWithImage[]

    const urlEntries = docs
      .map((entry) => {
        const profileUrl = toAbsoluteUrl(`/dp/${entry.slug}`)
        const displayName = escapeXml(entry.name ?? 'Profile')

        const lastModified = entry.updatedAt || entry.publishedDate || entry.createdAt
        const lastmod = lastModified
          ? new Date(lastModified).toISOString()
          : new Date().toISOString()

        let imageMarkup = ''
        const media = entry.primaryImage

        if (media && typeof media === 'object' && 'url' in media && media.url) {
          const imgUrl = toAbsoluteUrl(media.url)
          const captionSource =
            ('caption' in media && typeof media.caption === 'string' && media.caption) ||
            ('alt' in media && typeof media.alt === 'string' && media.alt) ||
            entry.name ||
            'Profile image'

          imageMarkup = `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:caption>${escapeXml(captionSource)}</image:caption>
      <image:title>${displayName}</image:title>
    </image:image>`
        }

        return `  <url>
    <loc>${escapeXml(profileUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>${imageMarkup}
  </url>`
      })
      .join('\n')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`

    return new NextResponse(sitemap.trim(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
      },
    })
  } catch (error) {
    console.error('Failed to generate profiles sitemap:', error)

    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`

    return new NextResponse(emptySitemap.trim(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    })
  }
}
