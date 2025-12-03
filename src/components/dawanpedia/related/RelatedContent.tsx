import Link from 'next/link'

import type { BlogPost } from '@/payload-types'
import type { DawanpediaEntry } from '@/lib/dawanpedia-types'

interface RelatedContentProps {
  blogPosts?: BlogPost[]
  entries?: DawanpediaEntry[]
}

export function RelatedContent({ blogPosts, entries }: Readonly<RelatedContentProps>) {
  if ((!blogPosts || blogPosts.length === 0) && (!entries || entries.length === 0)) {
    return null
  }

  return (
    <div className="space-y-8">
      {blogPosts && blogPosts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h2>
          <ul className="space-y-3">
            {blogPosts.map((post) => (
              <li key={post.id} className="flex items-start gap-3 group">
                <svg
                  className="w-5 h-5 text-[#b01c14] flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <Link
                  href={`/news/${post.slug}`}
                  className="text-gray-700 hover:text-[#b01c14] transition-colors group-hover:underline"
                >
                  {post.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {entries && entries.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Entries</h2>
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 group">
                <svg
                  className="w-5 h-5 text-[#b01c14] flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <Link
                  href={`/dp/${entry.slug}`}
                  className="text-gray-700 hover:text-[#b01c14] transition-colors group-hover:underline"
                >
                  {entry.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
