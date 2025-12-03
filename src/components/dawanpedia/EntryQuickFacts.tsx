import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DawanpediaEntry } from '@/lib/dawanpedia'
import { lexicalToPlainText } from '@/utils/lexical'

export interface EntryQuickFactsProps {
  entry: DawanpediaEntry
}

export function EntryQuickFacts({ entry }: Readonly<EntryQuickFactsProps>) {
  if (!entry.profileFacts || entry.profileFacts.length === 0) {
    return null
  }

  return (
    <section className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-sm">
      <header className="mb-5 flex items-center gap-3 border-b border-gray-200/80 pb-4">
        <div className="rounded-lg bg-[#b01c14]/10 p-2">
          <Info className="h-5 w-5 text-[#b01c14]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">Quick Facts</h2>
          <p className="text-xs text-gray-500">Key details at a glance</p>
        </div>
      </header>
      <dl className="space-y-4">
        {entry.profileFacts.map((fact: { label?: string | null; value?: unknown }) => {
          if (!fact?.label) {
            return null
          }

          const factText = lexicalToPlainText(fact.value as Record<string, unknown>)

          if (!factText) {
            return null
          }

          return (
            <div
              key={fact.label}
              className="border-b border-gray-200/60 pb-4 last:border-0 last:pb-0"
            >
              <dt className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <span className="h-1 w-1 rounded-full bg-[#b01c14]" />
                {fact.label}
              </dt>
              <dd className={cn('text-sm leading-relaxed text-gray-900')}>{factText}</dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
