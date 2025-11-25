'use client'

import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import {
  FaEnvelope,
  FaFacebook,
  FaShareAlt,
  FaLink,
  FaLinkedinIn,
  FaSpinner,
  FaTwitter,
  FaWhatsapp,
} from 'react-icons/fa'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MediaShareProps {
  title: string
  url?: string
  description?: string
  className?: string
  iconSize?: number
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon'
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  showLabel?: boolean
}

export const MediaShare: React.FC<MediaShareProps> = ({
  title,
  url,
  description = '',
  className,
  iconSize = 18,
  buttonSize = 'icon',
  buttonVariant = 'outline',
  showLabel = false,
}) => {
  const [resolvedUrl, setResolvedUrl] = useState(url ?? '')
  const [isSharing, setIsSharing] = useState(false)
  const [shareResult, setShareResult] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (url) {
      setResolvedUrl(url)
      return
    }

    if (typeof globalThis.window !== 'undefined') {
      setResolvedUrl(globalThis.window.location.href)
    }
  }, [url])

  const shareLinks = useMemo(
    () => [
      {
        name: 'Facebook',
        icon: <FaFacebook size={iconSize} />,
        color: 'bg-[#1877F2] text-white hover:bg-[#0C63D4]',
        getLink: () =>
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resolvedUrl)}&quote=${encodeURIComponent(title)}`,
      },
      {
        name: 'Twitter',
        icon: <FaTwitter size={iconSize} />,
        color: 'bg-[#1DA1F2] text-white hover:bg-[#0c85d0]',
        getLink: () =>
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(resolvedUrl)}`,
      },
      {
        name: 'LinkedIn',
        icon: <FaLinkedinIn size={iconSize} />,
        color: 'bg-[#0077B5] text-white hover:bg-[#005582]',
        getLink: () =>
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resolvedUrl)}`,
      },
      {
        name: 'WhatsApp',
        icon: <FaWhatsapp size={iconSize} />,
        color: 'bg-[#25D366] text-white hover:bg-[#1da851]',
        getLink: () => {
          const message = `${title} ${resolvedUrl}`
          return `https://wa.me/?text=${encodeURIComponent(message)}`
        },
      },
      {
        name: 'Email',
        icon: <FaEnvelope size={iconSize} />,
        color: 'bg-gray-600 text-white hover:bg-gray-700',
        getLink: () => {
          const body = `${description}\n\n${resolvedUrl}`
          const encodedSubject = encodeURIComponent(title)
          const encodedBody = encodeURIComponent(body)
          return `mailto:?subject=${encodedSubject}&body=${encodedBody}`
        },
      },
    ],
    [description, iconSize, resolvedUrl, title],
  )

  const handleNativeShare = async () => {
    setIsSharing(true)
    setShareResult(null)

    try {
      if (!resolvedUrl) {
        throw new Error('Share URL unavailable')
      }

      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title,
          text: description || `Eeg maqaalkan: ${title}`,
          url: resolvedUrl,
        })
        setShareResult({ message: 'Si guul leh ayaa loo wadaagay!', type: 'success' })
        setIsOpen(false)
      } else {
        setShareResult({ message: 'Wadashaqayn toos ah lama taageero', type: 'error' })
      }
    } catch (error) {
      console.error('Error sharing content:', error)
      setShareResult({ message: 'Wadaagistu way fashilantay', type: 'error' })
    } finally {
      setIsSharing(false)
      setTimeout(() => setShareResult(null), 3000)
    }
  }

  const handleCopyLink = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    setIsSharing(true)
    setShareResult(null)

    try {
      if (!resolvedUrl) {
        throw new Error('Share URL unavailable')
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resolvedUrl)
        setShareResult({ message: 'Xiriirka waa la koobiyeeyay!', type: 'success' })
      } else {
        setShareResult({ message: 'Koobiye URL-kan gacantaada', type: 'error' })
        setTimeout(() => {
          globalThis.prompt?.('Koobiye to clipboard: Ctrl+C, Enter', resolvedUrl)
        }, 500)
      }
    } catch (error) {
      console.error('Error copying link:', error)
      setShareResult({ message: 'Koobiyeynta xiriirka way fashilantay', type: 'error' })
    } finally {
      setIsSharing(false)
      setTimeout(() => setShareResult(null), 3000)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            buttonVariants({ variant: buttonVariant, size: buttonSize }),
            'cursor-pointer',
            className,
          )}
          aria-label="La wadaag"
          type="button"
        >
          <FaShareAlt className={cn('h-4 w-4', showLabel && 'mr-2')} />
          {showLabel && <span>La wadaag</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">La wadaag maqaalkan</h3>
          <Button
            className="mb-2 w-full bg-primary text-white hover:bg-primary/90 cursor-pointer"
            onClick={handleNativeShare}
            disabled={isSharing}
            type="button"
          >
            {isSharing ? (
              <FaSpinner className="h-4 w-4 animate-spin" />
            ) : (
              <FaShareAlt className="h-4 w-4 mr-2" />
            )}
            <span>La wadaag</span>
          </Button>

          <div className="flex flex-wrap justify-between gap-2">
            {shareLinks.map((socialLink) => (
              <a
                key={socialLink.name}
                href={resolvedUrl ? socialLink.getLink() : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'rounded-full p-2 transition-colors cursor-pointer flex items-center justify-center',
                  !resolvedUrl && 'pointer-events-none opacity-50',
                  socialLink.color,
                )}
                style={{ width: '40px', height: '40px' }}
                aria-label={`La wadaag ${socialLink.name}`}
              >
                {socialLink.icon}
              </a>
            ))}

            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="icon"
              className="rounded-full cursor-pointer w-[40px] h-[40px]"
              disabled={isSharing}
              aria-label="Koobiye xiriirka"
              type="button"
            >
              <FaLink size={iconSize} />
            </Button>
          </div>

          {shareResult && (
            <p
              className={cn(
                'mt-2 text-center text-xs',
                shareResult.type === 'success' ? 'text-green-600' : 'text-red-600',
              )}
            >
              {shareResult.message}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
