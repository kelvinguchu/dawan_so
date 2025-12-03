import type { Block } from 'payload'

import { createSectionMetaFields } from './common.ts'

export const DawanpediaMediaEmbed: Block = {
  slug: 'dawanpediaMediaEmbed',
  labels: {
    singular: 'Media Embed',
    plural: 'Media Embeds',
  },
  fields: [
    ...createSectionMetaFields(),
    {
      name: 'embedType',
      label: 'Embed Type',
      type: 'select',
      required: true,
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
        { label: 'Twitter/X', value: 'twitter' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'embedUrl',
      label: 'Embed URL',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      label: 'Caption',
      type: 'text',
    },
    {
      name: 'aspectRatio',
      label: 'Aspect Ratio',
      type: 'select',
      defaultValue: '16:9',
      options: [
        { label: '16:9', value: '16:9' },
        { label: '4:3', value: '4:3' },
        { label: '1:1', value: '1:1' },
        { label: '9:16', value: '9:16' },
      ],
    },
  ],
}
