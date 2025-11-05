import { uploadthingStorage } from '@payloadcms/storage-uploadthing'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { resendAdapter } from '@payloadcms/email-resend'
import path from 'node:path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { BlogPost } from './collections/BlogPosts'
import { BlogCategories } from './collections/BlogCategories'
import { Podcasts } from './collections/Podcasts'
import { Staging } from './collections/Staging'
import { Newsletter } from './collections/Newsletter'
import { NewsletterCampaigns } from './collections/NewsletterCampaigns'
import { PodcastSeries } from './collections/PodcastSeries'
import { PushSubscriptions } from './collections/PushSubscriptions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL:
    process.env.NODE_ENV === 'production' ? 'https://www.dawan.so' : 'http://localhost:3000',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Dawan TV',
      favicon: '/favicon.png',
      ogImage: '/og-default.png',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/favicon.png',
        },
      ],
    },
    components: {
      graphics: {
        Logo: './components/admin/Logo.tsx',
        Icon: './components/admin/Icon.tsx',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },

  collections: [
    Users,
    Media,
    BlogPost,
    BlogCategories,
    Podcasts,
    Staging,
    Newsletter,
    NewsletterCampaigns,
    PodcastSeries,
    PushSubscriptions,
  ],
  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: mongooseAdapter({
    url: process.env.DATABASE_URI ?? '',
    transactionOptions: false,
    connectOptions: {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
      tls: shouldEnableTls,
      tlsAllowInvalidCertificates: false,
    },
  }),

  email: resendAdapter({
    defaultFromAddress: 'info@dawan.so',
    defaultFromName: 'Dawan TV',
    apiKey: process.env.RESEND_API_KEY || '',
  }),

  express: {
    json: { limit: '500mb' },
    urlencoded: { limit: '500mb', extended: true },
  },

  upload: {
    limits: {
      fileSize: 300_000_000,
    },
  },

  sharp,

  plugins: [
    uploadthingStorage({
      collections: {
        media: true,
      },
      options: {
        token: process.env.UPLOADTHING_TOKEN,
        acl: 'public-read',
        clientUploads: true,
        routerInputConfig: {
          video: { maxFileSize: '300MB' },
          audio: { maxFileSize: '500MB' },
          blob: { maxFileSize: '300MB' },
          pdf: { maxFileSize: '100MB' },
          image: { maxFileSize: '20MB' },
        },
      },
    }),

    payloadCloudPlugin(),
  ],
})
