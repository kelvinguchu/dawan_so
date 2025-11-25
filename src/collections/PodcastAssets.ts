import type { CollectionConfig } from 'payload'

export const PodcastAssets: CollectionConfig = {
  slug: 'podcastAssets',
  admin: {
    group: 'Media Management',
  },
  access: {
    read: () => true,
  },
  fields: [],
  upload: {
    mimeTypes: ['audio/*', 'video/*'],
  },
}
