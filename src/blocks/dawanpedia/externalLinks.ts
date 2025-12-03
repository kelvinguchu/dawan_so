import type { Block } from 'payload'

import { createSectionMetaFields } from './common.ts'

export const DawanpediaExternalLinks: Block = {
  slug: 'dawanpediaExternalLinks',
  labels: {
    singular: 'External Links',
    plural: 'External Links',
  },
  fields: [
    ...createSectionMetaFields(),
    {
      name: 'links',
      label: 'Links',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'label',
          label: 'Label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
        },
        {
          name: 'icon',
          label: 'Icon',
          type: 'select',
          options: [
            { label: 'Link', value: 'link' },
            { label: 'Document', value: 'document' },
            { label: 'Video', value: 'video' },
            { label: 'Audio', value: 'audio' },
            { label: 'External', value: 'external' },
          ],
        },
      ],
    },
  ],
}
