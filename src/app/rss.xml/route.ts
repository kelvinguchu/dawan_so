import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { generateRSSFeed } from '@/utils/rssUtils'
import { BlogPost } from '@/payload-types'

export const revalidate = 3600

async function getPublishedPosts(limit: number = 50): Promise<BlogPost[]> {
  try {
    const payload = await getPayload({ config })

    const response = await payload.find({
      collection: 'blogPosts',
      where: {
        status: {
          equals: 'published',
        },
      },
      limit,
      sort: '-createdAt',
      depth: 2,
    })

    return response.docs
  } catch (error) {
    console.error('Error fetching posts for RSS feed:', error)
    return []
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50

    const posts = await getPublishedPosts(limit)

    const rssXml = generateRSSFeed(posts)

    return new Response(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)

    return new Response(
      `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Dawan TV - RSS Feed Error</title>
    <description>An error occurred while generating the RSS feed</description>
    <link>https://dawan.so</link>
  </channel>
</rss>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
        },
      },
    )
  }
}
