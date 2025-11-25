import type { CollectionConfig } from 'payload'

const MAX_VIDEO_SIZE_BYTES = 1_500_000_000

export const HeadlineVideos: CollectionConfig = {
  slug: 'headlineVideos',
  labels: {
    singular: 'Headline Video',
    plural: 'Headline Videos',
  },
  admin: {
    group: 'Content Management',
    useAsTitle: 'title',
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
      admin: {
        description: 'Internal label shown in the media library.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
      admin: {
        description: 'Optional notes or synopsis for the uploaded episode.',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Thumbnail Image',
      admin: {
        description: 'Upload a thumbnail image for this video.',
      },
    },
    {
      name: 'views',
      type: 'number',
      label: 'Views',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'likes',
      type: 'number',
      label: 'Likes',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  upload: {
    mimeTypes: ['video/*'],
  },
  hooks: {
    beforeValidate: [
      ({ req }) => {
        if (!req.file) return
        const { mimetype, size } = req.file

        if (!mimetype?.startsWith('video/')) {
          throw new Error('Only video uploads are allowed in the video library')
        }

        if (size && size > MAX_VIDEO_SIZE_BYTES) {
          throw new Error('Video files must be smaller than 1.5GB')
        }
      },
    ],
  },
}
