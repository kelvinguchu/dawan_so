import React from 'react'
import Image from 'next/image'
import { Media } from '@/payload-types'
import { FileText } from 'lucide-react'
import { LexicalContent } from './BlockUtils'
import ImageStructuredData from '@/components/structured-data/ImageStructuredData'

interface ImageBlockProps {
  image: Media | string | null
  altText?: string
}

interface CoverBlockProps {
  image?: Media | string | null
  heading?: LexicalContent | string | null
  subheading?: string
  hideTextOverlay?: boolean
}

interface OptimizedVideoProps {
  videoUrl: string
  caption?: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  loop?: boolean
}

interface VideoBlockProps {
  video?: Media | string | null
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  loop?: boolean
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ image, altText }) => {
  const imageUrl = typeof image === 'string' ? null : image?.url
  const alt = altText ?? (typeof image === 'string' ? 'Sawir' : (image?.alt ?? 'Sawirka maqaalka'))
  const imageObj = typeof image === 'string' ? null : image

  if (!imageUrl)
    return (
      <div className="my-8 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        [Sawir lama heli karo]
      </div>
    )

  return (
    <>
      <figure className="my-8">
        <div className="rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.01] duration-300">
          <Image
            src={imageUrl}
            alt={alt}
            width={imageObj?.width ?? 1200}
            height={imageObj?.height ?? 800}
            className="w-full h-auto object-contain max-h-[500px] sm:max-h-[600px] md:max-h-[700px]"
          />
        </div>
        {alt && <figcaption className="text-center text-sm text-gray-600 mt-3">{alt}</figcaption>}
      </figure>
      {imageObj && (
        <ImageStructuredData
          image={imageObj}
          pageUrl={typeof window !== 'undefined' ? window.location.href : ''}
          siteName="Dawan TV"
        />
      )}
    </>
  )
}

export const CoverBlock: React.FC<CoverBlockProps> = ({
  image,
  heading,
  subheading,
  hideTextOverlay,
}) => {
  const imageUrl = typeof image === 'string' ? null : image?.url
  const imageObj = typeof image === 'string' ? null : image

  // Extract heading text from Lexical data structure if available
  let headingText = 'Cinwaanka Maqaalka'

  if (heading && typeof heading === 'object') {
    // Try to extract from Lexical structure
    const lexicalHeading = heading as LexicalContent
    if (lexicalHeading.root?.children?.[0]) {
      const firstChild = lexicalHeading.root.children[0]
      if (
        'children' in firstChild &&
        firstChild.children?.[0] &&
        'text' in firstChild.children[0]
      ) {
        headingText = String(firstChild.children[0].text)
      }
    }
  } else if (typeof heading === 'string') {
    headingText = heading
  }

  return (
    <div className="my-8 sm:my-10 md:my-12 relative rounded-xl overflow-hidden shadow-xl min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
      {imageUrl ? (
        // With image
        <>
          <Image
            src={imageUrl}
            alt={imageObj?.alt || headingText}
            fill
            className="object-cover"
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </>
      ) : (
        // Without image - gradient background
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-800"></div>
      )}

      {!hideTextOverlay && (
        <div className="relative z-10 flex flex-col justify-center items-center text-center h-full p-6 sm:p-10 md:p-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 max-w-3xl drop-shadow-md">
            {headingText}
          </h2>
          {subheading && (
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl font-light drop-shadow-sm">
              {subheading}
            </p>
          )}
        </div>
      )}

      {/* Visual elements */}
      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-r from-white/0 via-white/10 to-white/0"></div>

      {/* Structured data for SEO */}
      {imageObj && imageObj.filename && (
        <ImageStructuredData
          image={imageObj}
          pageUrl={typeof window !== 'undefined' ? window.location.href : ''}
          siteName="Dawan TV"
        />
      )}
    </div>
  )
}

// Loading skeleton displayed while video metadata loads
export const VideoSkeleton: React.FC = () => (
  <div className="my-8">
    <div className="rounded-lg overflow-hidden shadow-lg bg-gray-100 animate-pulse">
      <div className="aspect-video bg-gray-200 flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
          <div className="w-0 h-0 border-l-[12px] border-l-gray-400 border-y-[8px] border-y-transparent ml-1"></div>
        </div>
      </div>
    </div>
  </div>
)

// Optimized video component with progressive loading and error handling
export const OptimizedVideo: React.FC<OptimizedVideoProps> = ({
  videoUrl,
  caption,
  autoplay = false,
  muted = false,
  controls = true,
  loop = false,
}) => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  return (
    <figure className="my-8">
      <div className="rounded-lg overflow-hidden shadow-lg bg-black relative">
        {/* Loading skeleton - shown until video metadata loads */}
        {isLoading && (
          <div className="absolute inset-0 z-10">
            <VideoSkeleton />
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>Ma suurtagelin in muuqaalka la soo raro</p>
            </div>
          </div>
        )}

        {/* Actual video element */}
        <video
          src={videoUrl}
          autoPlay={autoplay}
          muted={muted}
          controls={controls}
          loop={loop}
          preload="metadata" // Load metadata only for faster initial loading
          playsInline // Required for iOS inline playback
          className={`w-full h-auto transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ aspectRatio: '16/9' }} // Prevent layout shift
          onLoadedMetadata={() => {
            setIsLoading(false)
          }}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          aria-label={caption ?? 'Video content'}
        >
          <source src={videoUrl} type="video/mp4" />
          Brawser-kaagu ma taageero qaybta muuqaalka.
        </video>
      </div>

      {caption && (
        <figcaption className="text-center text-gray-600 mt-3 text-sm">{caption}</figcaption>
      )}
    </figure>
  )
}

// Video block component that handles different video input types
export const VideoBlock: React.FC<VideoBlockProps> = ({
  video,
  autoplay = false,
  muted = false,
  controls = true,
  loop = false,
}) => {
  const videoUrl = typeof video === 'string' ? video : (video as Media | null)?.url
  const videoObj = typeof video === 'string' ? null : video
  const caption = videoObj?.caption

  if (!videoUrl) {
    return (
      <div className="my-8 p-6 bg-gray-50 border border-gray-300 rounded-lg text-center">
        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600">Muuqaal lama heli karo</p>
      </div>
    )
  }

  // Video element handles its own loading states
  return (
    <OptimizedVideo
      videoUrl={videoUrl}
      caption={caption || undefined}
      autoplay={autoplay}
      muted={muted}
      controls={controls}
      loop={loop}
    />
  )
}
