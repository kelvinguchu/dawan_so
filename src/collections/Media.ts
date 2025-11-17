import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Media Management',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      required: true,
      admin: {
        description: 'Alternative text for images (important for accessibility & SEO)',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      admin: {
        description: 'Optional caption for the media file',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  hooks: {
    beforeValidate: [
      ({ req }) => {
        if (req.file) {
          const { mimetype, size } = req.file

          if (mimetype?.startsWith('image/') && size > 20000000) {
            throw new Error('Image files must be smaller than 20MB')
          }

          if (!mimetype?.startsWith('image/')) {
            throw new Error('Only image uploads are allowed in the media library')
          }
        }
      },
    ],
  },
}
