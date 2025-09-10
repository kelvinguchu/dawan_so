import { MetadataRoute } from 'next'
import { siteConfig } from '@/app/shared-metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
