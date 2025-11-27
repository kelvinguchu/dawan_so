import React from 'react'
import type { BlogPost } from '@/payload-types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPostExcerpt, getPostImageFromLayout, getPostAuthorName } from '@/utils/postUtils'
import { Article } from '@/components/news/Article'
import siteConfig, { sharedMetadata } from '@/app/shared-metadata'
import { getPostBySlug, getRelatedPosts } from '@/lib/blog-actions'

type Props = {
  readonly params: Promise<{ readonly slug: string }>
}

function generateNewsArticleSchema(post: BlogPost, excerpt: string, imageUrl: string) {
  const authorName = getPostAuthorName(post)
  const categories =
    post.categories
      ?.map((cat) => (typeof cat === 'string' ? null : cat.name))
      .filter((name): name is string => name !== null) || []

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.name,
    description: excerpt || siteConfig.description,
    image: imageUrl ? [imageUrl] : [`${siteConfig.url}/og-default.png`],
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: authorName,
      url: `${siteConfig.url}/news?reporter=${encodeURIComponent(authorName)}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dawan TV',
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
        width: 144,
        height: 144,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/news/${post.slug}`,
    },
    url: `${siteConfig.url}/news/${post.slug}`,
    articleSection: categories[0] || 'Warar',
    keywords: categories.join(', '),
    inLanguage: 'so',
    isAccessibleForFree: true,
    articleBody: excerpt,
  }
}

function generateBreadcrumbSchema(post: BlogPost) {
  const category = post.categories?.[0]
  const categoryName = typeof category === 'string' ? null : category?.name
  const categorySlug = typeof category === 'string' ? null : category?.slug

  const baseItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Bogga Hore',
      item: siteConfig.url,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Warar',
      item: `${siteConfig.url}/news`,
    },
  ]

  const categoryItems =
    categoryName && categorySlug
      ? [
          {
            '@type': 'ListItem',
            position: 3,
            name: categoryName,
            item: `${siteConfig.url}/categories/${categorySlug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: post.name,
            item: `${siteConfig.url}/news/${post.slug}`,
          },
        ]
      : [
          {
            '@type': 'ListItem',
            position: 3,
            name: post.name,
            item: `${siteConfig.url}/news/${post.slug}`,
          },
        ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [...baseItems, ...categoryItems],
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      ...sharedMetadata,
      title: 'Maqaal Lama Helin | Dawan TV',
    }
  }

  const excerpt = getPostExcerpt(post)
  const coverImageUrl = getPostImageFromLayout(post.layout)
  let ogImageUrl = `${siteConfig.url}/og-default.png`
  if (coverImageUrl) {
    ogImageUrl = coverImageUrl.startsWith('http')
      ? coverImageUrl
      : `${siteConfig.url}${coverImageUrl}`
  }

  return {
    ...sharedMetadata,
    title: `${post.name} | Dawan TV`,
    description:
      excerpt ||
      'Akhri maqaal xiiso leh oo ka mid ah Dawan TV — il lagu kalsoonaan karo oo warar iyo aragtiyo ka bixisa Soomaaliya.',
    openGraph: {
      ...sharedMetadata.openGraph,
      title: post.name,
      description:
        excerpt ||
        'Akhri maqaal xiiso leh oo ka mid ah Dawan TV — il lagu kalsoonaan karo oo warar iyo aragtiyo ka bixisa Soomaaliya.',
      url: new URL(`/news/${slug}`, siteConfig.url).toString(),
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [siteConfig.url],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.name,
        },
      ],
    },
    twitter: {
      ...sharedMetadata.twitter,
      title: post.name,
      description:
        excerpt ||
        'Akhri maqaal xiiso leh oo ka mid ah Dawan TV — il lagu kalsoonaan karo oo warar iyo aragtiyo ka bixisa Soomaaliya.',
      images: [ogImageUrl],
    },
    alternates: {
      canonical: new URL(`/news/${slug}`, siteConfig.url).toString(),
    },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  let relatedPosts: BlogPost[] = []
  if (post.categories && post.categories.length > 0) {
    const categoryIds = post.categories
      .map((cat) => (typeof cat === 'string' ? cat : cat.id))
      .filter((id): id is string => id != null)

    if (categoryIds.length > 0) {
      relatedPosts = await getRelatedPosts(categoryIds, post.id)
    }
  }

  const excerpt = getPostExcerpt(post)
  const coverImageUrl = getPostImageFromLayout(post.layout)
  const resolveImageUrl = (url: string | null): string => {
    if (!url) return `${siteConfig.url}/og-default.png`
    if (url.startsWith('http')) return url
    return `${siteConfig.url}${url}`
  }
  const imageUrl = resolveImageUrl(coverImageUrl)

  const newsArticleSchema = generateNewsArticleSchema(post, excerpt, imageUrl)
  const breadcrumbSchema = generateBreadcrumbSchema(post)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(newsArticleSchema).replaceAll('<', '\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replaceAll('<', '\u003c'),
        }}
      />
      <main className="bg-gray-50 min-h-screen">
        <Article post={post} relatedPosts={relatedPosts} />
      </main>
    </>
  )
}
