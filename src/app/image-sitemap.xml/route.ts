import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { siteConfig } from '@/app/shared-metadata'

export async function GET() {
  const payload = await getPayload({ config })
  const baseUrl = siteConfig.url

  try {
    const mediaFiles = await payload.find({
      collection: 'media',
      where: {
        mimeType: {
          like: 'image/',
        },
      },
      limit: 50000,
    })

    const urlEntries = mediaFiles.docs
      .filter((media) => media.filename)
      .map((media) => {
        const imageUrl = `${baseUrl}/api/media/file/${encodeURIComponent(media.filename || '')}`
        const pageUrl = imageUrl

        const escapeXml = (str: string) =>
          str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')

        const caption = escapeXml(media.caption || media.alt || media.filename || '')
        const title = escapeXml(media.alt || media.filename || 'Image')

        return `  <url>
    <loc>${pageUrl}</loc>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:caption>${caption}</image:caption>
      <image:title>${title}</image:title>
    </image:image>
    <lastmod>${new Date(media.updatedAt || media.createdAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`
      })
      .join('\n')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating image sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
