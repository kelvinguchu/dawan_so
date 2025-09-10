'use client'

import React, { useEffect, useState } from 'react'
import { SharePopover } from './SharePopover'

interface SharePopoverClientProps {
  title: string
  url?: string
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
  className?: string
}

export const SharePopoverClient: React.FC<SharePopoverClientProps> = ({
  title,
  url,
  buttonVariant = 'outline',
  buttonSize = 'default',
  showLabel = false,
  className,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(url || '')

  useEffect(() => {
    if (!url && typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
    }
  }, [url])

  return (
    <SharePopover
      title={title}
      url={currentUrl}
      buttonVariant={buttonVariant}
      buttonSize={buttonSize}
      showLabel={showLabel}
      className={className}
    />
  )
}
