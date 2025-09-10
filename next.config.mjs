import { withPayload } from '@payloadcms/next/withPayload'
import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        tls: false,
        net: false,
        dns: false,
        child_process: false,
        'google-gax': false,
        '@google-cloud/text-to-speech': false,
      }
    }
    return config
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
                        value:
              "frame-ancestors 'self'; " +
              "frame-src 'self' https://www.googletagmanager.com https://*.doubleclick.net https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://*.google.com https://www.scoreaxis.com https://scoreaxis.com https://*.scoreaxis.com; " +
              "connect-src 'self' https://*.google-analytics.com https://www.googletagmanager.com https://www.google.com https://*.google.com https://*.doubleclick.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://fundingchoicesmessages.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://api.open-meteo.com https://pro-api.coinmarketcap.com; " +
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://tpc.googlesyndication.com https://pagead2.googlesyndication.com https://securepubads.g.doubleclick.net https://googleads.g.doubleclick.net https://fundingchoicesmessages.google.com https://ep2.adtrafficquality.google; " +
              "img-src * data: blob:; " +
              "style-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.gstatic.com; ",
          },
        ],
      },
      {
        source: '/(.*\\.(?:mp4|webm|avi|mov|wmv|flv|mkv|m4v))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Accept-Ranges', value: 'bytes' },
          { key: 'Content-Type', value: 'video/mp4' },
        ],
      },
    ]
  },

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2678400,
  },
}

const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  exclude: [
    ({ asset }) => {
      const excludeList = [
        /\.map$/,
        /^manifest.*\.js$/,
        /^server\//,
        /^(((app-)?build-manifest|react-loadable-manifest|dynamic-css-manifest)\.json)$/,
      ]
      return excludeList.some((regex) => regex.test(asset.name))
    },
  ],
  importScripts: ['/worker.js'],
})

export default withPWAConfig(withPayload(nextConfig))
