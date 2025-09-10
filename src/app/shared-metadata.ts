import type { Metadata } from 'next'

export const siteConfig = {
  name: 'Dawan TV',
  description: 'Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya iyo Geeska Afrika',
  url: process.env.NODE_ENV === 'production' ? 'https://dawan.so' : 'http://localhost:3000',
  themeColor: '#b01c14',
}

export const sharedMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Soomaaliya',
    'Wararka Soomaaliya',
    'Warar',
    'Falanqayn',
    'Dawan TV',
    'Geeska Afrika',
    'Bariga Afrika',
    'Siyaasadda',
    'Ganacsi',
    'Dhaqaale',
    'War Degdeg',
    'Arrimaha Maanta',
    'Warbaahin Soomaaliya',
    'Bulsho',
    'Dhaqan',
    'Horumarin',
    'Tignoolajiyad',
    'Caafimaad',
    'Waxbarasho',
    'Ciyaaraha',
    'Madadaalo',
    'Aragtiyo',
    'Raad-raac',
    'U Taagan',
    'Shaqooyin',
  ],
  generator: 'Next.js',
  applicationName: siteConfig.name,
  referrer: 'origin-when-cross-origin',
  authors: [{ name: 'Dawan TV', url: siteConfig.url }],
  creator: 'Dawan TV',
  publisher: 'Dawan TV',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'so_SO',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${siteConfig.description}`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/og-default.png'],
    creator: '@dawanatv',
    site: '@dawanatv',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '84QZctK6dL25aaWZQeIS4z04cFQTcKGTSnyZmMJzcvk',
  },
  category: 'warar',
  classification: 'Website Warar',
  other: {
    'og:site_name': siteConfig.name,
    'application-name': siteConfig.name,
    'apple-mobile-web-app-title': siteConfig.name,
    'msapplication-TileColor': siteConfig.themeColor,
    'theme-color': siteConfig.themeColor,
  },
}

export default siteConfig
