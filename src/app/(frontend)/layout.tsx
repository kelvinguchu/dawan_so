import React, { Suspense } from 'react'
import '../global.css'
import HeaderServer from '@/components/layout/HeaderServer'
import Footer from '@/components/layout/Footer'

import NewsletterPopup from '@/components/NewsletterPopup'
import { Source_Sans_3 } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { Loading } from '@/components/global/Loading'
import type { Metadata, Viewport } from 'next'
import { sharedMetadata } from '@/app/shared-metadata'
import siteConfig from '@/app/shared-metadata'
import { GoogleAnalytics } from '@next/third-parties/google'
import { WebVitals } from '@/hooks/useWebVitals'
import { RSSDiscovery } from '@/components/rss'
import Script from 'next/script'
import { PageViewTracker } from '@/components/analytics/GoogleAnalyticsEvents'

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-source-sans-3',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: sharedMetadata.themeColor,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  ...sharedMetadata,
  manifest: '/manifest.json',
  verification: {
    google: '84QZctK6dL25aaWZQeIS4z04cFQTcKGTSnyZmMJzcvk',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
    startupImage: [
      {
        url: '/logo.png',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/logo.png',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/logo.png',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/logo.png',
        media:
          '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/logo.png',
        media:
          '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': siteConfig.name,
    'apple-mobile-web-app-title': siteConfig.name,
    'msapplication-TileColor': '#000000',
    'msapplication-tap-highlight': 'no',
    'msapplication-starturl': '/',
  },
}

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dawan TV',
    alternateName: 'Dawan TV News',
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: 'Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya iyo Geeska Afrika',
    sameAs: [
      'https://x.com/dawanafrica?s=11&t=cGgYbc_v8C1zcdmiZHSiRg',
      'https://www.facebook.com/share/1DLeMnVa2e/?mibextid=wwXIfr',
      'https://youtube.com/@dawanafrica?si=MeDNmWJDGkFWiF45',
      'https://www.tiktok.com/@dawanafrica?_t=ZS-8wXUI4l8QKX&_r=1',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Tifaftir',
      email: 'Info@dawan.so',
      telephone: '+252628881171',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Marinio Rd',
      addressLocality: 'Mogadishu',
      addressCountry: 'Somalia',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dawan TV',
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
  }

  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dawan TV',
    alternateName: 'Dawan TV News',
    url: siteConfig.url,
    description: 'Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya iyo Geeska Afrika',
    publisher: {
      '@type': 'Organization',
      name: 'Dawan TV',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/news?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  // Site Navigation structured data for better sitelinks
  const navigationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Hagaha Dawan TV',
    url: siteConfig.url,
    hasPart: [
      {
        '@type': 'SiteNavigationElement',
        name: 'Warar',
        description: 'Warar iyo dhacdooyin muhiim ah',
        url: `${siteConfig.url}/categories/warar`,
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Aragtiyo',
        description: 'Faallooyin, aragtiyo iyo talooyin',
        url: `${siteConfig.url}/categories/aragtiyo`,
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Raad Raac',
        description: 'Raad-raac iyo falanqayn qoto dheer',
        url: `${siteConfig.url}/categories/raad_raac`,
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'U Taagan',
        description: 'Barnaamijyada U Taagan iyo arrimo bulsho',
        url: `${siteConfig.url}/categories/u_taagan`,
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Shaqooyin',
        description: 'Fursadaha shaqo iyo xirfado',
        url: `${siteConfig.url}/categories/shaqooyin`,
      },
    ],
  }

  // Breadcrumb List for homepage
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Bogga Hore',
        item: siteConfig.url,
      },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${sourceSans3.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#b01c14" />

        {/* RSS Feed Discovery */}
        <RSSDiscovery />

        {/* Funding Choices (Consent) */}
        <Script
          id="funding-choices"
          strategy="beforeInteractive"
          src="https://fundingchoicesmessages.google.com/i/pub-5247780644977108?ers=1"
        />
        <Script
          id="funding-choices-present"
          strategy="beforeInteractive"
        >{`(function(){function signalGooglefcPresent(){try{if(!window.frames['googlefcPresent']){if(document.body){var iframe=document.createElement('iframe');iframe.style.cssText='display:none';iframe.name='googlefcPresent';document.body.appendChild(iframe);}else{setTimeout(signalGooglefcPresent,0);}}}catch(e){}}signalGooglefcPresent();})();`}</Script>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData).replace(/</g, '\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(navigationStructuredData).replace(/</g, '\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, '\u003c'),
          }}
        />
      </head>
      <body className={cn('font-sans', 'min-h-screen flex flex-col bg-gray-50')}>
        <WebVitals />
        <Suspense fallback={<Loading fullScreen={true} message="Soo raraya..." />}>
          <PageViewTracker />
          <AuthProvider>
            <QueryProvider>
              <NavigationProvider>
                <Toaster richColors position="top-right" />
                <HeaderServer />
                <main className="flex-grow">{children}</main>
                <Footer />
                <NewsletterPopup delay={5000} />
              </NavigationProvider>
            </QueryProvider>
          </AuthProvider>
        </Suspense>

        {/* AdSense */}
        <Script
          async
          data-no-optimize="true"
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5247780644977108"
          crossOrigin="anonymous"
        />

        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Diiwaangelinta Service Worker waa guulaysatay');
                    },
                    function(err) {
                      console.log('Diiwaangelinta Service Worker way fashilantay: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
