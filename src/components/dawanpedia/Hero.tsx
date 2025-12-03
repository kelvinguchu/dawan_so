import Image from 'next/image'
import { User, Building2, Calendar } from 'lucide-react'

import type { DawanpediaEntry } from '@/lib/dawanpedia'
import { getMediaUrl, getMediaAlt } from '@/utils/media'

interface HeroProps {
  entry: DawanpediaEntry
}

export function Hero({ entry }: Readonly<HeroProps>) {
  const imageUrl = getMediaUrl(entry.primaryImage)
  const isPerson = entry.entryType === 'person'

  return (
    <header className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="lg:flex lg:h-[400px]">
        {/* Image Section */}
        {imageUrl && (
          <div className="relative w-full h-64 sm:h-80 lg:w-1/2 lg:h-full">
            <Image
              src={imageUrl}
              alt={getMediaAlt(entry.primaryImage, entry.name)}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 space-y-4 lg:w-1/2 lg:flex lg:flex-col lg:justify-center lg:p-12">
          {/* Badge */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#b01c14] px-3 py-1.5 text-sm font-semibold text-white">
              {isPerson ? (
                <>
                  <User className="h-4 w-4" />
                  <span>Person</span>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4" />
                  <span>Business</span>
                </>
              )}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {entry.name}
          </h1>

          {/* Published Date */}
          {entry.publishedDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>
                Published{' '}
                {new Date(entry.publishedDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
