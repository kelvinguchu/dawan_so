'use client'

import type { DawanpediaEntry } from '@/lib/dawanpedia-types'
import { resolveEntryAnchor } from '@/lib/dawanpedia-types'
import { TimelineSection } from '@/components/dawanpedia/timeline/TimelineSection'
import { ReferenceList } from '@/components/dawanpedia/references/ReferenceList'
import { RichTextRenderer } from '@/components/news/blockrender/RichTextRenderer'

interface SectionRendererProps {
  entry: DawanpediaEntry
}

type Section = NonNullable<DawanpediaEntry['sections']>[number]
type TimelineEvent = {
  title?: string | null
  startDate?: string | null
  endDate?: string | null
  isOngoing?: boolean | null
  description?: unknown
}

const hasTimelineEvents = (section: Section): section is Section & { events: TimelineEvent[] } => {
  return Array.isArray((section as { events?: unknown }).events)
}

const hasCustomReferences = (
  section: Section,
): section is Section & {
  displayMode: 'custom'
  customReferences: NonNullable<DawanpediaEntry['references']>
} => {
  return (
    (section as { displayMode?: unknown }).displayMode === 'custom' &&
    Array.isArray((section as { customReferences?: unknown }).customReferences)
  )
}

export function SectionRenderer({ entry }: Readonly<SectionRendererProps>) {
  if (!entry.sections?.length) {
    return null
  }

  return (
    <>
      {entry.sections.map((section: Section) => {
        const anchor = resolveEntryAnchor(section.heading, section.id ?? 'section')

        return (
          <section key={section.id ?? section.heading} id={anchor} className="scroll-mt-48">
            <header className="mb-6 border-b border-gray-200 pb-3">
              <h2 className="text-2xl font-bold text-gray-900">{section.heading}</h2>
            </header>
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#b01c14] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-[#b01c14] prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-[#b01c14] prose-blockquote:bg-[#b01c14]/5 prose-img:rounded-lg prose-img:shadow-md">
              <RichTextRenderer
                content={section.content as Parameters<typeof RichTextRenderer>[0]['content']}
              />
            </div>
            {hasTimelineEvents(section) ? <TimelineSection events={section.events} /> : null}
            {hasCustomReferences(section) ? (
              <ReferenceList references={section.customReferences} />
            ) : null}
          </section>
        )
      })}
    </>
  )
}
