'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BiChevronRight, BiHome } from 'react-icons/bi'
import { siteConfig } from '@/app/shared-metadata'

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[]
  className?: string
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customItems, className = '' }) => {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems

    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ name: 'Bogga Hore', href: '/' }]

    let currentPath = ''
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`

      let name = segment.charAt(0).toUpperCase() + segment.slice(1)

      if (segment === 'news') name = 'Wararkii Ugu Dambeeyay'
      if (segment === 'category' || segment === 'categories') name = 'Qaybaha'
      if (segment === 'about') name = 'Nagu Saabsan'

      breadcrumbs.push({
        name,
        href: currentPath,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.href}`,
    })),
  }

  if (pathname === '/') return null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, '\\u003c'),
        }}
      />

      <nav className={`bg-gray-50 border-b border-gray-200 ${className}`} aria-label="Breadcrumb">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index > 0 && <BiChevronRight className="w-4 h-4 text-gray-400 mx-2" />}

                {index === 0 && <BiHome className="w-4 h-4 text-gray-500 mr-1" />}

                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{item.name}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-[#b01c14] transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  )
}

export default Breadcrumbs
