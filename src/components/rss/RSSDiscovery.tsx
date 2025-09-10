import siteConfig from '@/app/shared-metadata'

interface RSSDiscoveryProps {
  category?: string
  title?: string
}

export function RSSDiscovery({ category, title }: RSSDiscoveryProps) {
  const feedUrl = category ? `/rss/${category}` : '/rss.xml'
  const feedTitle = title || (category ? `${siteConfig.name} - ${category}` : siteConfig.name)

  return (
    <>
      <link
        rel="alternate"
        type="application/rss+xml"
        title={feedTitle}
        href={feedUrl}
      />
      <link
        rel="feed"
        type="application/rss+xml"
        title={feedTitle}
        href={feedUrl}
      />
    </>
  )
}

interface RSSLinkProps {
  category?: string
  className?: string
  children?: React.ReactNode
}

export function RSSLink({ category, className = '', children }: RSSLinkProps) {
  const feedUrl = category ? `/rss/${category}` : '/rss.xml'
  
  return (
    <a
      href={feedUrl}
      className={`inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors ${className}`}
      title="Ku biir quudinta RSS"
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3.429 2.571c0-.952.771-1.714 1.714-1.714a1.71 1.71 0 011.714 1.714 1.71 1.71 0 01-1.714 1.714 1.71 1.71 0 01-1.714-1.714zM.857 2.571C.857 1.167 2.024 0 3.429 0s2.571 1.167 2.571 2.571S4.833 5.143 3.429 5.143.857 3.976.857 2.571zM3.429 7.429c3.048 0 5.714 2.666 5.714 5.714a1.71 1.71 0 01-1.714 1.714 1.71 1.71 0 01-1.714-1.714c0-1.381-1.19-2.571-2.571-2.571a1.71 1.71 0 01-1.714-1.714A1.71 1.71 0 013.429 7.43zM3.429 12.286c4.762 0 8.571 3.81 8.571 8.571a1.71 1.71 0 01-1.714 1.714 1.71 1.71 0 01-1.714-1.714c0-3.048-2.524-5.714-5.714-5.714a1.71 1.71 0 01-1.714-1.714 1.71 1.71 0 011.714-1.714z"/>
      </svg>
      {children || 'Quudin RSS'}
    </a>
  )
}

interface RSSButtonProps {
  category?: string
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function RSSButton({ 
  category, 
  className = '', 
  variant = 'secondary',
  size = 'md'
}: RSSButtonProps) {
  const feedUrl = category ? `/rss/${category}` : '/rss.xml'
  
  const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-orange-600 text-orange-600 hover:bg-orange-50 focus:ring-orange-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <a
      href={feedUrl}
      className={classes}
      title="Ku biir quudinta RSS"
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3.429 2.571c0-.952.771-1.714 1.714-1.714a1.71 1.71 0 011.714 1.714 1.71 1.71 0 01-1.714 1.714 1.71 1.71 0 01-1.714-1.714zM.857 2.571C.857 1.167 2.024 0 3.429 0s2.571 1.167 2.571 2.571S4.833 5.143 3.429 5.143.857 3.976.857 2.571zM3.429 7.429c3.048 0 5.714 2.666 5.714 5.714a1.71 1.71 0 01-1.714 1.714 1.71 1.71 0 01-1.714-1.714c0-1.381-1.19-2.571-2.571-2.571a1.71 1.71 0 01-1.714-1.714A1.71 1.71 0 013.429 7.43zM3.429 12.286c4.762 0 8.571 3.81 8.571 8.571a1.71 1.71 0 01-1.714 1.714 1.71 1.71 0 01-1.714-1.714c0-3.048-2.524-5.714-5.714-5.714a1.71 1.71 0 01-1.714-1.714 1.71 1.71 0 011.714-1.714z"/>
      </svg>
      Ku Biir RSS
    </a>
  )
}
