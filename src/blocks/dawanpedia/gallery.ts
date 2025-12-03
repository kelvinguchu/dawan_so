import type { Block } from 'payload'

import { createSectionMetaFields } from './common.ts'

export const DawanpediaGallery: Block = {
  slug: 'dawanpediaGallery',
  labels: {
    singular: 'Gallery',
    plural: 'Galleries',
  },
  fields: [
    ...createSectionMetaFields(),
    {
      name: 'images',
      label: 'Images',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          label: 'Caption',
          type: 'text',
        },
      ],
    },
    {
      name: 'layout',
      label: 'Layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Masonry', value: 'masonry' },
        { label: 'Carousel', value: 'carousel' },
      ],
    },
  ],
}
