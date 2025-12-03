import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { Hero } from '@/components/dawanpedia/Hero'
import { EntryLayout } from '@/components/dawanpedia/layout/EntryLayout'
import { EntryQuickFacts } from '@/components/dawanpedia/EntryQuickFacts'
import { TableOfContents } from '@/components/dawanpedia/TableOfContents'
import { SectionRenderer } from '@/components/dawanpedia/sections/SectionRenderer'
import { RelatedContent } from '@/components/dawanpedia/related/RelatedContent'
import { ReferenceList } from '@/components/dawanpedia/references/ReferenceList'
import type { BlogPost } from '@/payload-types'
import type { DawanpediaEntry } from '@/lib/dawanpedia-types'
import { resolveEntryAnchor } from '@/lib/dawanpedia-types'
import { buildDawanpediaMetadata, buildStructuredData } from '@/lib/dawanpedia-metadata'
import { getDawanpediaEntry, getDawanpediaEntryMetadata } from '@/lib/dawanpedia'
import { sharedMetadata } from '@/app/shared-metadata'

interface PageProps {
  params: Promise<{ dawanpedia: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const revalidate = 300

export async function generateMetadata({ params }: Readonly<PageProps>): Promise<Metadata> {
  const { dawanpedia: slug } = await params
  const entry = await getDawanpediaEntryMetadata(slug)

  if (!entry) {
    return {
      ...sharedMetadata,
      title: 'Entry Not Found',
    }
  }

  return buildDawanpediaMetadata(entry)
}

function buildToc(entry: Awaited<ReturnType<typeof getDawanpediaEntry>>) {
  const items = []

  // Add Profile section (Hero + Quick Facts)
  items.push({
    id: 'profile',
    title: 'Profile',
    depth: 0,
  })

  // Add content sections
  if (entry?.sections?.length) {
    for (const section of entry.sections) {
      items.push({
        id: resolveEntryAnchor(section.heading, section.id ?? 'section'),
        title: section.heading,
        depth: 0,
      })
    }
  }

  return items
}

async function EntryContent({
  slug,
  searchParams,
}: Readonly<{
  slug: string
  searchParams: Record<string, string | string[] | undefined>
}>) {
  const previewFlag = Array.isArray(searchParams.preview)
    ? searchParams.preview[0]
    : searchParams.preview

  const draftFlag = Array.isArray(searchParams.draft) ? searchParams.draft[0] : searchParams.draft

  const shouldLoadDraft = previewFlag === 'true' || draftFlag === 'true'

  const entry = await getDawanpediaEntry(slug, shouldLoadDraft ? { draft: true } : undefined)

  if (!entry) {
    notFound()
  }

  const structuredData = buildStructuredData(entry)

  const relatedEntries = (entry.relatedContent?.relatedEntries ?? []).filter(
    (related): related is DawanpediaEntry =>
      typeof related === 'object' && related !== null && 'slug' in related && 'name' in related,
  )

  const relatedPosts = (entry.relatedContent?.blogPosts ?? []).filter(
    (post): post is BlogPost =>
      typeof post === 'object' && post !== null && 'slug' in post && 'name' in post,
  )

  const tocItems = buildToc(entry)
  const heroContent = (
    <div id="profile" className="space-y-6">
      <Hero entry={entry} />
      <EntryQuickFacts entry={entry} />
    </div>
  )

  return (
    <EntryLayout
      hero={heroContent}
      sidebar={
        <div className="space-y-6">
          <TableOfContents items={tocItems} />
        </div>
      }
      related={<RelatedContent blogPosts={relatedPosts} entries={relatedEntries} />}
    >
      <SectionRenderer entry={entry} />
      <ReferenceList references={entry.references ?? []} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </EntryLayout>
  )
}

export default async function DawanpediaPage({ params, searchParams }: Readonly<PageProps>) {
  const { dawanpedia: slug } = await params
  const search = (await searchParams) ?? {}

  return (
    <main>
      <Suspense fallback={<div className="py-16 text-center text-gray-500">Loading entry…</div>}>
        <EntryContent slug={slug} searchParams={search} />
      </Suspense>
    </main>
  )
}
