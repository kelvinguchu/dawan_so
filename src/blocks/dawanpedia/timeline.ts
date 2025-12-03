import type { Block } from 'payload'

import { createRichTextField, createSectionMetaFields } from './common.ts'

export const DawanpediaTimeline: Block = {
  slug: 'dawanpediaTimeline',
  labels: {
    singular: 'Timeline',
    plural: 'Timelines',
  },
  fields: [
    ...createSectionMetaFields(),
    {
      name: 'events',
      label: 'Events',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'title',
          label: 'Event Title',
          type: 'text',
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'startDate',
              label: 'Start Date',
              type: 'date',
              admin: {
                width: '33%',
              },
            },
            {
              name: 'endDate',
              label: 'End Date',
              type: 'date',
              admin: {
                width: '33%',
              },
            },
            {
              name: 'isOngoing',
              label: 'Ongoing',
              type: 'checkbox',
              admin: {
                width: '33%',
              },
            },
          ],
        },
        createRichTextField({
          name: 'description',
          label: 'Description',
        }),
      ],
    },
  ],
}
