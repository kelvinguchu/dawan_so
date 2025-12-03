import type { Block } from 'payload'

import { createRichTextField, createSectionMetaFields } from './common.ts'

export const DawanpediaCallout: Block = {
  slug: 'dawanpediaCallout',
  labels: {
    singular: 'Callout',
    plural: 'Callouts',
  },
  fields: [
    ...createSectionMetaFields(),
    {
      name: 'type',
      label: 'Callout Type',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Note', value: 'note' },
      ],
    },
    createRichTextField({
      name: 'body',
      label: 'Content',
      required: true,
    }),
  ],
}
