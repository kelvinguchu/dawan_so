import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { escapeXml } from '@/utils/rssUtils'
import { BlogPost, BlogCategory } from '@/payload-types'
import siteConfig from '@/app/shared-metadata'

export const revalidate = 3600

async function getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  try {
    const payload = await getPayload({ config })

    const response = await payload.find({
      collection: 'blogCategories',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    })

    return response.docs[0] || null
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

async function getPostsByCategory(categoryId: string, limit: number = 50): Promise<BlogPost[]> {
  try {
    const payload = await getPayload({ config })

    const response = await payload.find({
      collection: 'blogPosts',
      where: {
        and: [
          {
            status: {
              equals: 'published',
            },
          },
          {
            categories: {
              in: [categoryId],
            },
          },
        ],
      },
      limit,
      sort: '-createdAt',
      depth: 2,
    })

    return response.docs
  } catch (error) {
    console.error('Error fetching posts by category:', error)
    return []
  }
}

function generateCategoryRSSFeed(posts: BlogPost[], category: BlogCategory): string {
  const title = escapeXml(`${siteConfig.name} - ${category.name}`)
  const description = escapeXml(`Latest ${category.name} news from ${siteConfig.name}`)
  const link = `${siteConfig.url}/categories/${category.slug}`
  const lastBuildDate = new Date().toUTCString()
  const language = 'en-us'

  const items = posts
    .map((post) => {
      const postTitle = escapeXml(post.name || 'Untitled')
      const postLink = `${siteConfig.url}/news/${post.slug}`
      const postDescription = escapeXml(post.name || 'Read more on Dawan TV')
      const pubDate = new Date(post.createdAt).toUTCString()
      const guid = `${siteConfig.url}/news/${post.slug}`

      return `
    <item>
      <title>${postTitle}</title>
      <link>${postLink}</link>
      <description>${postDescription}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${guid}</guid>
      <category>${escapeXml(category.name)}</category>
    </item>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <description>${description}</description>
    <link>${link}</link>
    <atom:link href="${siteConfig.url}/rss/${category.slug}" rel="self" type="application/rss+xml" />
    <language>${language}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Next.js RSS Generator</generator>
    <webMaster>info@dawan.so (Dawan TV)</webMaster>
    <managingEditor>info@dawan.so (Dawan TV)</managingEditor>
    <copyright>Copyright ${new Date().getFullYear()} ${siteConfig.name}</copyright>
    <category>${escapeXml(category.name)}</category>
    <image>
      <url>${siteConfig.url}/logo.png</url>
      <title>${title}</title>
      <link>${link}</link>
      <width>144</width>
      <height>144</height>
    </image>${items}
  </channel>
</rss>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> },
): Promise<Response> {
  try {
    const { category: categorySlug } = await params

    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50

    const category = await getCategoryBySlug(categorySlug)
    if (!category) {
      return new Response('Category not found', { status: 404 })
    }

    const posts = await getPostsByCategory(category.id, limit)

    const rssXml = generateCategoryRSSFeed(posts, category)

    return new Response(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch (error) {
    console.error('Error generating category RSS feed:', error)

    return new Response(
      `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Dawan TV - RSS Feed Error</title>
    <description>An error occurred while generating the category RSS feed</description>
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
