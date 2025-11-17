import type { CollectionConfig } from 'payload'

export const ArticleAudio: CollectionConfig = {
  slug: 'articleAudio',
  admin: {
    group: 'Media Management',
    useAsTitle: 'title',
    description: 'Narrated article audio uploads.',
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
        description: 'Optional label to help editors find article narrations.',
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
