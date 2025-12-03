import type { Block } from 'payload'

import { createSectionMetaFields } from './common.ts'

export const DawanpediaQuote: Block = {
  slug: 'dawanpediaQuote',
  labels: {
    singular: 'Quote',
    plural: 'Quotes',
  },
  fields: [
    ...createSectionMetaFields(),
    {
      name: 'quote',
      label: 'Quote Text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'attribution',
      label: 'Attribution',
      type: 'text',
    },
    {
      name: 'source',
      label: 'Source',
      type: 'text',
    },
    {
      name: 'sourceUrl',
      label: 'Source URL',
      type: 'text',
    },
  ],
}
