import React from 'react'
import { ExternalLink, FileText, Download } from 'lucide-react'
import { Media } from '../../../payload-types'

// Twitter Embed Block Component
const TwitterEmbedBlock: React.FC<{
  content: string
  title?: string
  caption?: string
}> = ({ content, title, caption }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)

  React.useEffect(() => {
    const loadTwitterWidgets = async () => {
      // Check if Twitter widgets script is already loaded
      if (!(window as any).twttr) {
        // Load the script
        const script = document.createElement('script')
        script.src = 'https://platform.twitter.com/widgets.js'
        script.async = true
        script.charset = 'utf-8'

        script.onload = () => {
          setIsLoaded(true)
          // Process widgets after script loads
          if ((window as any).twttr?.widgets && containerRef.current) {
            ;(window as any).twttr.widgets.load(containerRef.current)
          }
        }

        document.head.appendChild(script)
      } else {
        // Script already loaded, just process widgets
        setIsLoaded(true)
        if ((window as any).twttr?.widgets && containerRef.current) {
          ;(window as any).twttr.widgets.load(containerRef.current)
        }
      }
    }

    if (content.includes('twitter-tweet')) {
      loadTwitterWidgets()
    }
  }, [content])

  // Extract blockquote only (remove script tags to avoid duplication)
  const blockquoteContent = content.replace(/<script[^>]*>.*?<\/script>/gi, '')

  return (
    <figure className="my-8">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="twitter-embed-container w-full max-w-lg mx-auto"
          dangerouslySetInnerHTML={{ __html: blockquoteContent }}
        />
      </div>
      {!isLoaded && (
        <div className="text-center text-sm text-gray-500 mt-2">Waxyaabaha Twitter waa la rarayaa...</div>
      )}
      {caption && (
        <figcaption className="text-center text-gray-600 mt-3 text-sm">{caption}</figcaption>
      )}
    </figure>
  )
}

// Helper function to detect platform from URL
const detectPlatform = (url: string): string => {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube'
    if (hostname.includes('vimeo.com')) return 'vimeo'
    if (hostname.includes('spotify.com')) return 'spotify'
    if (hostname.includes('soundcloud.com')) return 'soundcloud'
    if (hostname.includes('twitch.tv')) return 'twitch'
    if (hostname.includes('dailymotion.com')) return 'dailymotion'
    if (hostname.includes('facebook.com')) return 'facebook'
    if (hostname.includes('instagram.com')) return 'instagram'
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter'
    if (hostname.includes('tiktok.com')) return 'tiktok'
    if (hostname.includes('codepen.io')) return 'codepen'
    if (hostname.includes('codesandbox.io')) return 'codesandbox'
    if (hostname.includes('github.com') || hostname.includes('gist.github.com')) return 'github'

    return 'generic'
  } catch {
    return 'generic'
  }
}

// Helper function to convert URL to embed URL
const getEmbedUrl = (url: string, detectedPlatform: string): string => {
  try {
    const urlObj = new URL(url)

    switch (detectedPlatform) {
      case 'youtube': {
        let videoId = ''
        if (urlObj.hostname.includes('youtu.be')) {
          videoId = urlObj.pathname.slice(1)
        } else {
          videoId = urlObj.searchParams.get('v') || ''
        }

        return `https://www.youtube.com/embed/${videoId}`
      }

      case 'vimeo': {
        const videoId = urlObj.pathname.split('/')[1]
        return `https://player.vimeo.com/video/${videoId}`
      }

      case 'spotify': {
        // Convert Spotify URL to embed format
        if (url.includes('/embed/')) {
          return url
        }

        // Handle different Spotify URL formats
        if (url.includes('/track/')) {
          return url.replace('/track/', '/embed/track/')
        } else if (url.includes('/album/')) {
          return url.replace('/album/', '/embed/album/')
        } else if (url.includes('/playlist/')) {
          return url.replace('/playlist/', '/embed/playlist/')
        } else if (url.includes('/artist/')) {
          return url.replace('/artist/', '/embed/artist/')
        }

        return url
      }

      case 'soundcloud': {
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`
      }

      case 'twitch': {
        const channel = urlObj.pathname.slice(1)
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
        return `https://player.twitch.tv/?channel=${channel}&parent=${hostname}`
      }

      case 'codepen': {
        const penId = urlObj.pathname.split('/pen/')[1]?.split('/')[0]
        return `https://codepen.io/embed/${penId}?default-tab=result`
      }

      case 'codesandbox': {
        const sandboxId = urlObj.pathname.split('/s/')[1]?.split('/')[0]
        return `https://codesandbox.io/embed/${sandboxId}`
      }

      default:
        return url
    }
  } catch {
    return url
  }
}

// Embed Block Component
const EmbedBlock: React.FC<{
  content?: string
  title?: string
  caption?: string
}> = ({ content, title, caption }) => {
  if (!content) {
    return (
      <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-lg text-center">
        <p className="text-slate-600">Embed content not provided</p>
      </div>
    )
  }

  const trimmedContent = content.trim()

  // Check if content is HTML embed code
  if (trimmedContent.startsWith('<') && trimmedContent.endsWith('>')) {
    // Special handling for Twitter embeds
    if (
      trimmedContent.includes('twitter-tweet') ||
      trimmedContent.includes('platform.twitter.com')
    ) {
      return <TwitterEmbedBlock content={trimmedContent} title={title} caption={caption} />
    }

    // For other HTML embeds
    return (
      <figure className="my-8">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="rounded-lg overflow-hidden shadow-lg">
          <div
            className="embed-html-content [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: trimmedContent }}
          />
        </div>
        {caption && (
          <figcaption className="text-center text-gray-600 mt-3 text-sm">{caption}</figcaption>
        )}
      </figure>
    )
  }

  // If not HTML, treat as URL and process as before
  const url = trimmedContent
  const detectedPlatform = detectPlatform(url)
  const embedUrl = getEmbedUrl(url, detectedPlatform)

  // Special handling for Spotify (different layout)
  if (detectedPlatform === 'spotify') {
    return (
      <figure className="my-8">
        <div className="rounded-lg overflow-hidden shadow-lg bg-black">
          <iframe
            src={embedUrl}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={title || 'Spotify Embed'}
            className="w-full"
          />
        </div>
        {title && <h3 className="text-lg font-semibold mt-4 mb-2">{title}</h3>}
        {caption && (
          <figcaption className="text-center text-gray-600 text-sm">{caption}</figcaption>
        )}
      </figure>
    )
  }

  // Special handling for Twitter/X embeds
  if (detectedPlatform === 'twitter') {
    return (
      <figure className="my-8">
        <div className="max-w-md mx-auto">
          <blockquote className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-gray-800 mb-3">Twitter/X embed content</p>
            <cite className="text-sm text-gray-600">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                View on X/Twitter <ExternalLink className="inline h-3 w-3 ml-1" />
              </a>
            </cite>
          </blockquote>
        </div>
        {title && <h3 className="text-lg font-semibold mt-4 mb-2">{title}</h3>}
        {caption && (
          <figcaption className="text-center text-gray-600 text-sm">{caption}</figcaption>
        )}
      </figure>
    )
  }

  // For other platforms, use iframe
  return (
    <figure className="my-8">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="rounded-lg overflow-hidden shadow-lg">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || 'Embed content'}
            loading="lazy"
          />
        </div>
      </div>
      {caption && (
        <figcaption className="text-center text-gray-600 mt-3 text-sm">{caption}</figcaption>
      )}
    </figure>
  )
}

// PDF Block Component
const PDFBlock: React.FC<{
  pdf?: Media | string | null
  showDownloadButton?: boolean
  showPreview?: boolean
  previewHeight?: number
}> = ({ pdf, showDownloadButton = true, showPreview = true, previewHeight = 600 }) => {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      return mobileRegex.test(userAgent) || window.innerWidth <= 768
    }

    setIsMobile(checkMobile())

    // Listen for resize to handle orientation changes
    const handleResize = () => setIsMobile(checkMobile())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const pdfUrl = typeof pdf === 'string' ? pdf : pdf?.url
  const pdfObj = typeof pdf === 'string' ? null : pdf
  const fileName = pdfObj?.filename || 'Document'
  const caption = pdfObj?.caption
  const fileSize = pdfObj?.filesize ? `${Math.round(pdfObj.filesize / 1024)} KB` : null

  if (!pdfUrl) {
    return (
      <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-lg text-center">
        <p className="text-slate-600">PDF document not available</p>
      </div>
    )
  }

  return (
    <div className="my-8 border border-slate-200 rounded-lg overflow-hidden shadow-md">
      {/* Header */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="font-medium text-slate-900">{fileName}</h3>
              {caption && <p className="text-sm text-slate-600 mt-1">{caption}</p>}
              {fileSize && <p className="text-xs text-slate-500 mt-0.5">{fileSize}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            {/* View button - always available */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Daawo
            </a>

            {/* Download button - only if explicitly allowed */}
            {showDownloadButton && (
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Soo deji
              </a>
            )}
          </div>
        </div>
      </div>

      {/* PDF Preview */}
      {showPreview && (
        <div className="bg-white">
          {isMobile ? (
            // Mobile-friendly PDF viewer
            <div className="p-8 text-center bg-slate-50">
              <div className="max-w-sm mx-auto">
                <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                  <FileText className="h-10 w-10 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Dukumenti PDF</h4>
                <p className="text-sm text-slate-600 mb-6">
                  Hordhacyada PDF laguma taageero aaladaha mobilada.
                  {fileSize && ` (Cabbirka faylka: ${fileSize})`}
                </p>

                {/* Only show buttons if download is allowed */}
                {showDownloadButton && (
                  <div className="space-y-3">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <ExternalLink className="h-4 w-4 inline mr-2" />
                      Ku fur Brawserka
                    </a>
                    <a
                      href={pdfUrl}
                      download
                      className="block w-full px-4 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                    >
                      <Download className="h-4 w-4 inline mr-2" />
                      Soo deji PDF
                    </a>
                  </div>
                )}

                {showDownloadButton && (
                  <p className="text-xs text-slate-500 mt-4">
                    Talo: Isticmaal “Ku fur Brawserka” si aad ugu aragto daawadeyaasha PDF-ga ee aaladdaada
                  </p>
                )}

                {/* If download not allowed, show message */}
                {!showDownloadButton && (
                  <p className="text-sm text-slate-500 italic">Dukumentigan keliya waa daawis</p>
                )}
              </div>
            </div>
          ) : (
            // Desktop iframe preview
            <div className="relative">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                width="100%"
                height={previewHeight}
                className="border-0"
                title={fileName}
                loading="lazy"
              />
              {/* Fallback content shown if iframe fails - moved outside iframe */}
              <div className="hidden pdf-fallback absolute inset-0 p-8 text-center bg-white">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 mb-4">Brawser-kaagu ma taageero hordhacyada PDF.</p>

                {/* Only show fallback buttons if download is allowed */}
                {showDownloadButton && (
                  <div className="space-y-2">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 mr-2 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Fur PDF
                    </a>
                    <a
                      href={pdfUrl}
                      download
                      className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Soo deji
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { TwitterEmbedBlock, EmbedBlock, PDFBlock }
