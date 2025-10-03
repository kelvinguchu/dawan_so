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
    mimeTypes: [
      'image/*',
      'video/*',
      'audio/*',
      'application/pdf',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/m4a',
      'audio/flac',
    ],
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

          if (mimetype?.startsWith('video/') && size > 300000000) {
            throw new Error('Video files must be smaller than 300MB')
          }

          if (mimetype === 'application/pdf' && size > 50000000) {
            throw new Error('PDF files must be smaller than 50MB')
          }

          if (mimetype?.startsWith('audio/') && size > 500000000) {
            throw new Error('Audio files must be smaller than 500MB')
          }
        }
      },
    ],
  },
}
