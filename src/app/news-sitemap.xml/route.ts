import { getPayload } from 'payload'
import config from '@/payload.config'
import siteConfig from '@/app/shared-metadata'
import { BlogPost } from '@/payload-types'

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return c
    }
  })
}

async function getRecentNewsPosts(): Promise<BlogPost[]> {
  const payload = await getPayload({ config })
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  try {
    const posts = await payload.find({
      collection: 'blogPosts',
      where: {
        and: [
          {
            createdAt: {
              greater_than_equal: twoDaysAgo.toISOString(),
            },
          },
          {
            status: {
              equals: 'published',
            },
          },
        ],
      },
      limit: 1000,
    })

    return posts.docs
  } catch (error) {
    console.error('Error fetching recent news posts for sitemap:', error)
    return []
  }
}

export async function GET() {
  const posts = await getRecentNewsPosts()

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    ${posts
      .map((post) => {
        const publicationDate = post.createdAt

        return `
    <url>
        <loc>${siteConfig.url}/news/${post.slug}</loc>
        <news:news>
            <news:publication>
                <news:name>${siteConfig.name}</news:name>
                <news:language>so</news:language>
            </news:publication>
            <news:publication_date>${new Date(publicationDate).toISOString()}</news:publication_date>
            <news:title>${escapeXml(post.name)}</news:title>
        </news:news>
    </url>`
      })
      .join('')}
</urlset>`

  return new Response(sitemap.trim(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
