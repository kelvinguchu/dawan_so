import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryPostsList } from '@/components/categories/CategoryPostsList'
import { BlogCategory } from '@/payload-types'
import { FootballLeagueButtons } from '@/components/categories/FootballLeagueButtons'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import siteConfig from '@/app/shared-metadata'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getCategory(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'blogCategories',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    })

    return result.docs?.[0] || null
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: 'Qaybta Lama Helin',
      description: 'Qaybta la codsaday lama helin.',
    }
  }

  const ogImageUrl = `${siteConfig.url}/og-default.png`

  return {
    title: `${category.name} - Warar & Maqaallo`,
    description: `Ka hel wararkii iyo maqaalladii ugu dambeeyay ee ${category.name}. La soco daboolid dhamaystiran iyo falanqayn.`,
    openGraph: {
      title: `${category.name} - Warar & Maqaallo`,
      description: `Ka hel wararkii iyo maqaalladii ugu dambeeyay ee ${category.name}. La soco daboolid dhamaystiran iyo falanqayn.`,
      url: new URL(`/categories/${category.slug}`, siteConfig.url).toString(),
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${category.name} - Dawan TV`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - Warar & Maqaallo`,
      description: `Ka hel wararkii iyo maqaalladii ugu dambeeyay ee ${category.name}. La soco daboolid dhamaystiran iyo falanqayn.`,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: new URL(`/categories/${category.slug}`, siteConfig.url).toString(),
    },
  }
}

export default async function CategoryPage({ params }: Readonly<CategoryPageProps>) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const isSportsCategory = category.slug === 'sports' || category.name.toLowerCase() === 'sports'

  return (
    <main className="bg-gray-50 min-h-screen">
      {isSportsCategory && <FootballLeagueButtons />}
      <CategoryPostsList categorySlug={category.slug} categoryName={category.name} />
    </main>
  )
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'blogCategories',
      limit: 100,
    })

    return (
      result.docs?.map((category: BlogCategory) => ({
        slug: category.slug,
      })) || []
    )
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}
