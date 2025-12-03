import type { Metadata } from 'next'

import { siteConfig, sharedMetadata } from '@/app/shared-metadata'
import { getMediaUrl, getMediaAlt, type MediaLike } from '@/utils/media'
import { lexicalToPlainText } from '../utils/lexical'

// Temporary type until payload-types.ts is regenerated
interface DawanpediaEntry {
  id: string
  name: string
  slug: string
  entryType: 'person' | 'business'
  primaryImage?: unknown
  publishedDate?: string | null
  profileFacts?: Array<{
    label?: string | null
    value?: unknown
  }> | null
}

const buildCanonicalUrl = (slug: string) => {
  return new URL(`/dp/${slug}`, siteConfig.url).toString()
}

const buildImages = (entry: Pick<DawanpediaEntry, 'primaryImage'>) => {
  const imageUrl = getMediaUrl(entry.primaryImage as MediaLike)

  if (!imageUrl) {
    return [
      {
        url: `${siteConfig.url}/logo.png`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ]
  }

  return [
    {
      url: imageUrl.startsWith('http') ? imageUrl : `${siteConfig.url}${imageUrl}`,
      width: 1200,
      height: 630,
      alt: getMediaAlt(entry.primaryImage as MediaLike, 'Profile image'),
    },
  ]
}

type MetadataInput = Pick<
  DawanpediaEntry,
  'slug' | 'name' | 'entryType' | 'primaryImage' | 'profileFacts' | 'publishedDate'
>

const buildDescription = (entry: MetadataInput) => {
  if (!entry.profileFacts || entry.profileFacts.length === 0) {
    return `${entry.name} profile on Dawanpedia.`
  }

  const firstFact = entry.profileFacts[0]
  if (!firstFact?.value) {
    return `${entry.name} profile on Dawanpedia.`
  }

  const factText = lexicalToPlainText(firstFact.value)

  if (!factText) {
    return `${entry.name} profile on Dawanpedia.`
  }

  return `${entry.name} — ${factText}`
}

export const buildDawanpediaMetadata = (entry: MetadataInput): Metadata => {
  const canonical = buildCanonicalUrl(entry.slug)
  const description = buildDescription(entry)

  const baseMetadata: Metadata = {
    ...sharedMetadata,
    title: `${entry.name} | Dawanpedia`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      ...sharedMetadata.openGraph,
      title: `${entry.name} | Dawanpedia`,
      description,
      url: canonical,
      type: entry.entryType === 'person' ? 'profile' : 'article',
      images: buildImages(entry),
    },
    twitter: {
      ...sharedMetadata.twitter,
      card: 'summary_large_image',
      title: `${entry.name} | Dawanpedia`,
      description,
      images: buildImages(entry).map((img) => img.url),
    },
  }

  return baseMetadata
}

export const buildStructuredData = (entry: MetadataInput) => {
  const base = {
    '@context': 'https://schema.org',
    name: entry.name,
    description: buildDescription(entry),
    url: buildCanonicalUrl(entry.slug),
  }

  if (entry.entryType === 'person') {
    return {
      ...base,
      '@type': 'Person',
      image: getMediaUrl(entry.primaryImage as MediaLike) ?? undefined,
    }
  }

  return {
    ...base,
    '@type': 'Organization',
    logo: getMediaUrl(entry.primaryImage as MediaLike) ?? undefined,
  }
}
