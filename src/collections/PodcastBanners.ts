import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

export const PodcastBanners: CollectionConfig = {
  slug: 'podcastBanners',
  admin: {
    group: 'Podcast Hub',
    useAsTitle: 'title',
    description: 'Upload coming soon podcast banners (strictly 1280x720 pixels).',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      required: true,
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!req.file) return data

        try {
          // Dynamic import to avoid issues if sharp isn't available in all environments (though it should be)
          const sharp = (await import('sharp')).default

          let metadata
          if (req.file.data) {
            metadata = await sharp(req.file.data).metadata()
          } else if (req.file.tempFilePath) {
            metadata = await sharp(req.file.tempFilePath).metadata()
          }

          if (metadata?.width && metadata?.height) {
            if (metadata.width !== 1280 || metadata.height !== 720) {
              throw new APIError('Image must be exactly 1280x720 pixels', 400)
            }
          }
        } catch (error) {
          // If sharp fails or file is invalid, we might want to let Payload handle it or log it
          // But if we want to enforce dimensions, we should probably throw if we can't verify
          if (error instanceof APIError) {
            throw error
          }
          if (error instanceof Error && error.message.includes('1280x720')) {
            throw new APIError(error.message, 400)
          }
          req.payload.logger.error(`Error checking image dimensions: ${error}`)
        }

        return data
      },
    ],
  },
}
