import React from 'react'
import type { BlogPost } from '@/payload-types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPostExcerpt, getPostImageFromLayout } from '@/utils/postUtils'
import { Article } from '@/components/news/Article'
import siteConfig, { sharedMetadata } from '@/app/shared-metadata'
import { getPostBySlug, getRelatedPosts } from '@/lib/blog-actions'

type Props = {
  readonly params: Promise<{ readonly slug: string }>
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

  return (
    <main className="bg-gray-50 min-h-screen">
      <Article post={post} relatedPosts={relatedPosts} />
    </main>
  )
}
