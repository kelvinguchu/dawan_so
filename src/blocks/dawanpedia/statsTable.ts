import type { Block } from 'payload'

import { createSectionMetaFields } from './common.ts'

export const DawanpediaStatsTable: Block = {
  slug: 'dawanpediaStatsTable',
  labels: {
    singular: 'Stats Table',
    plural: 'Stats Tables',
  },
  fields: [
    ...createSectionMetaFields(),
    {
      name: 'stats',
      label: 'Statistics',
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
          name: 'value',
          label: 'Value',
          type: 'text',
          required: true,
        },
        {
          name: 'unit',
          label: 'Unit',
          type: 'text',
        },
        {
          name: 'trend',
          label: 'Trend',
          type: 'select',
          options: [
            { label: 'Up', value: 'up' },
            { label: 'Down', value: 'down' },
            { label: 'Stable', value: 'stable' },
          ],
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
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
        { label: 'List', value: 'list' },
        { label: 'Cards', value: 'cards' },
      ],
    },
  ],
}
