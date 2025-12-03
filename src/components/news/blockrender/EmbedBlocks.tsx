'use client'

import React from 'react'
import { ExternalLink, FileText, Download } from 'lucide-react'
import { Media } from '../../../payload-types'

// ============================================
// TYPES & CONFIG
// ============================================

type SocialPlatform = 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'unknown'

interface WindowWithSocial {
  twttr?: {
    widgets?: { load: (el?: HTMLElement) => void }
    ready?: (fn: () => void) => void
  }
  instgrm?: { Embeds?: { process: () => void } }
  FB?: { XFBML?: { parse: () => void } }
}

const getWindow = (): WindowWithSocial => globalThis as unknown as WindowWithSocial

// ============================================
// PLATFORM DETECTION
// ============================================

const detectPlatform = (content: string): SocialPlatform => {
  const lower = content.toLowerCase()

  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube'
  if (lower.includes('twitter-tweet') || lower.includes('twitter.com') || lower.includes('x.com'))
    return 'twitter'
  if (lower.includes('instagram.com') || lower.includes('instagram-media')) return 'instagram'
  if (lower.includes('tiktok.com') || lower.includes('tiktok-embed')) return 'tiktok'
  if (lower.includes('facebook.com') || lower.includes('fb-post') || lower.includes('fb-video'))
    return 'facebook'

  return 'unknown'
}

// ============================================
// YOUTUBE EMBED COMPONENT
// ============================================

const YouTubeEmbed: React.FC<{ url: string; title?: string; caption?: string }> = ({
  url,
  title,
  caption,
}) => {
  const getVideoId = (urlStr: string): string | null => {
    try {
      const urlObj = new URL(urlStr)
      if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1)
      }
      return urlObj.searchParams.get('v')
    } catch {
      return null
    }
  }

  const videoId = getVideoId(url)
  if (!videoId) {
    return (
      <div className="my-8 p-4 bg-red-50 text-red-600 rounded-lg text-center">
        URL-ka YouTube waa khalad
      </div>
    )
  }

  return (
    <figure className="my-8">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="rounded-lg overflow-hidden shadow-lg">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title={title || 'Fiidiyowga YouTube'}
          />
        </div>
      </div>
      {caption && (
        <figcaption className="text-center text-gray-600 mt-3 text-sm">{caption}</figcaption>
      )}
    </figure>
  )
}

// ============================================
// SOCIAL EMBED COMPONENT
// ============================================

const SCRIPT_CONFIG: Record<string, { src: string; init: (container: HTMLElement) => void }> = {
  twitter: {
    src: 'https://platform.twitter.com/widgets.js',
    init: (container) => {
      const win = getWindow()
      if (win.twttr?.widgets?.load) {
        win.twttr.widgets.load(container)
      } else if (win.twttr?.ready) {
        win.twttr.ready(() => win.twttr?.widgets?.load(container))
      }
    },
  },
  instagram: {
    src: 'https://www.instagram.com/embed.js',
    init: () => getWindow().instgrm?.Embeds?.process(),
  },
  tiktok: {
    src: 'https://www.tiktok.com/embed.js',
    init: () => {
      /* TikTok auto-initializes */
    },
  },
  facebook: {
    src: 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0',
    init: () => getWindow().FB?.XFBML?.parse(),
  },
}

const SocialEmbed: React.FC<{
  html: string
  platform: Exclude<SocialPlatform, 'youtube' | 'unknown'>
  title?: string
  caption?: string
}> = ({ html, platform, title, caption }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading')

  const cleanHtml = React.useMemo(
    () => html.replaceAll(/<script[^>]*>[\s\S]*?<\/script>/gi, ''),
    [html],
  )

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = cleanHtml

    const config = SCRIPT_CONFIG[platform]
    if (!config) {
      setStatus('ready')
      return
    }

    const initEmbed = () => {
      config.init(container)
      setTimeout(() => setStatus('ready'), platform === 'twitter' ? 1500 : 500)
    }

    const scriptHost = new URL(config.src).hostname
    const existingScript = document.querySelector(`script[src*="${scriptHost}"]`)

    if (existingScript) {
      setTimeout(initEmbed, 100)
    } else {
      const script = document.createElement('script')
      script.src = config.src
      script.async = true
      script.onload = () => setTimeout(initEmbed, 300)
      script.onerror = () => setStatus('error')
      document.body.appendChild(script)
    }
  }, [cleanHtml, platform])

  const platformNames: Record<string, string> = {
    twitter: 'Twitter',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    facebook: 'Facebook',
  }

  return (
    <figure className="my-8">
      {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="w-full max-w-[550px] [&_.twitter-tweet]:mx-auto [&_.instagram-media]:mx-auto [&_iframe]:mx-auto"
        />
      </div>
      {status === 'loading' && (
        <div className="text-center text-sm text-gray-500 mt-3">
          Waa la soo rareyaa {platformNames[platform]}...
        </div>
      )}
      {status === 'error' && (
        <div className="text-center text-sm text-red-500 mt-3">Soo dejintu waa guul darreysatay</div>
      )}
      {caption && (
        <figcaption className="text-center text-gray-600 mt-3 text-sm">{caption}</figcaption>
      )}
    </figure>
  )
}

// ============================================
// MAIN EMBED BLOCK COMPONENT
// ============================================

const EmbedBlock: React.FC<{
  content?: string
  title?: string
  caption?: string
}> = ({ content, title, caption }) => {
  if (!content?.trim()) {
    return (
      <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-lg text-center">
        <p className="text-slate-600">Nuxurka embed lama bixin</p>
      </div>
    )
  }

  const trimmedContent = content.trim()
  const platform = detectPlatform(trimmedContent)
  const isHtml = trimmedContent.startsWith('<')

  if (platform === 'youtube' && !isHtml) {
    return <YouTubeEmbed url={trimmedContent} title={title} caption={caption} />
  }

  if (isHtml && platform !== 'unknown' && platform !== 'youtube') {
    return <SocialEmbed html={trimmedContent} platform={platform} title={title} caption={caption} />
  }

  if (platform === 'twitter' && !isHtml) {
    return (
      <figure className="my-8">
        {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
        <div className="flex justify-center">
          <a
            href={trimmedContent}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 rounded-full transition-colors text-white font-medium"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Ka eeg X</span>
          </a>
        </div>
        {caption && (
          <figcaption className="text-center text-gray-600 mt-3 text-sm">{caption}</figcaption>
        )}
      </figure>
    )
  }

  return (
    <figure className="my-8">
      {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
      <div className="flex justify-center">
        <a
          href={trimmedContent}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium"
        >
          <ExternalLink className="h-5 w-5" />
          <span>Eeg Nuxurka</span>
        </a>
      </div>
      {caption && (
        <figcaption className="text-center text-gray-600 mt-3 text-sm">{caption}</figcaption>
      )}
    </figure>
  )
}

// ============================================
// PDF BLOCK COMPONENT
// ============================================

const PDFBlock: React.FC<{
  pdf?: Media | string | null
  showDownloadButton?: boolean
  showPreview?: boolean
  previewHeight?: number
}> = ({ pdf, showDownloadButton = true, showPreview = true, previewHeight = 600 }) => {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      return mobileRegex.test(userAgent) || globalThis.window.innerWidth <= 768
    }

    setIsMobile(checkMobile())

    const handleResize = () => setIsMobile(checkMobile())
    globalThis.window.addEventListener('resize', handleResize)
    return () => globalThis.window.removeEventListener('resize', handleResize)
  }, [])

  const pdfUrl = typeof pdf === 'string' ? pdf : pdf?.url
  const pdfObj = typeof pdf === 'string' ? null : pdf
  const fileName = pdfObj?.filename || 'Dukumenti'
  const caption = pdfObj?.caption
  const fileSize = pdfObj?.filesize ? `${Math.round(pdfObj.filesize / 1024)} KB` : null

  if (!pdfUrl) {
    return (
      <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-lg text-center">
        <p className="text-slate-600">Dukumentiga PDF ma jiro</p>
      </div>
    )
  }

  return (
    <div className="my-8 border border-slate-200 rounded-lg overflow-hidden shadow-md">
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
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Eeg
            </a>

            {showDownloadButton && (
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Soo dejiso
              </a>
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="bg-white">
          {isMobile ? (
            <div className="p-8 text-center bg-slate-50">
              <div className="max-w-sm mx-auto">
                <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                  <FileText className="h-10 w-10 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Dukumentiga PDF</h4>
                <p className="text-sm text-slate-600 mb-6">
                  Dukumentiyada PDF looma taageero moobilka.
                  {fileSize && ` (Cabbirka: ${fileSize})`}
                </p>

                {showDownloadButton && (
                  <div className="space-y-3">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <ExternalLink className="h-4 w-4 inline mr-2" />
                      Ku fur Browser-ka
                    </a>
                    <a
                      href={pdfUrl}
                      download
                      className="block w-full px-4 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                    >
                      <Download className="h-4 w-4 inline mr-2" />
                      Soo dejiso PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                width="100%"
                height={previewHeight}
                className="border-0"
                title={fileName}
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { EmbedBlock, PDFBlock }
