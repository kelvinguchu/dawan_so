import type { Block, CollectionSlug } from 'payload'

import { createSectionMetaFields } from './common.ts'

export const DawanpediaReferenceList: Block = {
  slug: 'dawanpediaReferenceList',
  labels: {
    singular: 'Reference List',
    plural: 'Reference Lists',
  },
  fields: [
    ...createSectionMetaFields(),
    {
      name: 'displayMode',
      label: 'Display Mode',
      type: 'select',
      defaultValue: 'inherit',
      options: [
        { label: 'Inherit from Entry', value: 'inherit' },
        { label: 'Custom Selection', value: 'custom' },
      ],
    },
    {
      name: 'customReferences',
      label: 'Custom References',
      type: 'array',
      admin: {
        condition: (_, siblingData) => siblingData?.displayMode === 'custom',
      },
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
        },
        {
          name: 'publication',
          label: 'Publication',
          type: 'text',
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          required: true,
        },
        {
          name: 'accessedDate',
          label: 'Last Accessed',
          type: 'date',
        },
        {
          name: 'relatedEntry',
          label: 'Related Entry',
          type: 'relationship',
          relationTo: 'dawanpediaEntries' as CollectionSlug,
        },
      ],
    },
  ],
}
