import type { Block } from 'payload'

import { createRichTextField, createSectionMetaFields } from './common.ts'

export const DawanpediaRichText: Block = {
  slug: 'dawanpediaRichText',
  labels: {
    singular: 'Rich Text Section',
    plural: 'Rich Text Sections',
  },
  fields: [
    ...createSectionMetaFields(),
    createRichTextField({
      name: 'body',
      label: 'Content',
      required: true,
    }),
  ],
}
