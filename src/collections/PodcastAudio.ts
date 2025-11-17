import type { CollectionConfig } from 'payload'

export const PodcastAudio: CollectionConfig = {
  slug: 'podcastAudio',
  admin: {
    group: 'Audio Hub',
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Display Name',
      admin: {
        description: 'Optional label that makes audio uploads easier to find.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
  ],
  upload: {
    mimeTypes: ['audio/*'],
  },
}
