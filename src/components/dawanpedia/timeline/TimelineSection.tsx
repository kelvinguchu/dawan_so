import { lexicalToParagraphs } from '../../../utils/lexical'

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
  })
}

type TimelineEvent = {
  title?: string | null
  startDate?: string | null
  endDate?: string | null
  isOngoing?: boolean | null
  description?: unknown
}

interface TimelineSectionProps {
  events: TimelineEvent[]
}

export function TimelineSection({ events }: Readonly<TimelineSectionProps>) {
  if (!events || events.length === 0) {
    return null
  }

  return (
    <div className="mt-6 border-l-2 border-[#b01c14] pl-6 space-y-8">
      {events.map((event: TimelineEvent) => {
        const paragraphs = lexicalToParagraphs(event.description as Record<string, unknown>)
        const key =
          [event.title, event.startDate, event.endDate, paragraphs[0]?.text]
            .filter(Boolean)
            .join('-')
            .trim()
            .replaceAll(/\s+/g, '-')
            .toLowerCase() || 'event'

        const startLabel = formatDate(event.startDate) ?? 'Date unknown'

        let dateRangeSuffix = ''
        if (event.endDate) {
          const endLabel = formatDate(event.endDate)
          dateRangeSuffix = endLabel ? ` – ${endLabel}` : ''
        } else if (event.isOngoing) {
          dateRangeSuffix = ' – Present'
        }

        return (
          <article key={key} className="relative group">
            <span className="absolute -left-[29px] top-1 h-5 w-5 rounded-full bg-[#b01c14] border-4 border-white shadow-sm group-hover:scale-110 transition-transform" />
            <header className="space-y-1 mb-3">
              <div className="font-semibold text-gray-900 text-base">{event.title}</div>
              <time className="text-sm text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {startLabel}
                {dateRangeSuffix}
              </time>
            </header>
            <div className="text-sm text-gray-700 leading-relaxed space-y-2">
              {paragraphs.map(({ key: paragraphKey, text }) => (
                <p key={paragraphKey}>{text}</p>
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}
