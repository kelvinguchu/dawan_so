import type { DawanpediaEntry } from '@/lib/dawanpedia'

const formatDate = (value?: string | null) => {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

type Reference = NonNullable<DawanpediaEntry['references']>[number]

interface ReferenceListProps {
  references: Reference[]
}

export function ReferenceList({ references }: Readonly<ReferenceListProps>) {
  if (!references || references.length === 0) {
    return null
  }

  return (
    <section id="references" className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">References</h3>
      <ol className="space-y-4 text-sm text-gray-700">
        {references.map((reference, index) => {
          const key =
            [reference.title, reference.url, reference.publication]
              .filter(Boolean)
              .join('-')
              .toLowerCase()
              .replaceAll(/\s+/g, '-')
              .trim() || 'reference'

          let hostname: string | null = null

          if (reference.url) {
            try {
              hostname = new URL(reference.url).hostname
            } catch (error) {
              console.warn('Invalid reference URL:', reference.url, error)
            }
          }

          return (
            <li
              key={key}
              className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#b01c14]/10 text-[#b01c14] text-xs font-semibold">
                {index + 1}
              </span>
              <div className="flex-1 space-y-1">
                <div className="font-semibold text-gray-900">{reference.title}</div>
                {reference.publication && (
                  <div className="text-gray-600 italic">{reference.publication}</div>
                )}
                {reference.url && (
                  <a
                    href={reference.url}
                    className="text-[#b01c14] hover:text-[#8a1610] hover:underline inline-flex items-center gap-1 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{hostname ?? reference.url}</span>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
                {reference.accessedDate && (
                  <div className="text-xs text-gray-500">
                    Accessed {formatDate(reference.accessedDate)}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
