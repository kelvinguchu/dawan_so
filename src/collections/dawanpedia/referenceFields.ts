import type { CollectionSlug, Field } from 'payload'

const urlValidator = (value: unknown) => {
  if (!value) {
    return true
  }

  if (typeof value !== 'string') {
    return 'Enter a valid URL.'
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return true
  }

  return /^https?:\/\//i.test(trimmed) ? true : 'Enter a valid URL starting with http or https.'
}

export const referenceFields: Field[] = [
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
    validate: urlValidator,
  },
  {
    name: 'accessedDate',
    label: 'Last Accessed',
    type: 'date',
  },
  {
    name: 'citationText',
    label: 'Citation Text',
    type: 'textarea',
    admin: {
      rows: 3,
    },
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    defaultValue: 'article',
    options: [
      { label: 'Article', value: 'article' },
      { label: 'Official Document', value: 'official-document' },
      { label: 'Press Release', value: 'press-release' },
      { label: 'Interview', value: 'interview' },
      { label: 'Report', value: 'report' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    name: 'relatedEntry',
    label: 'Related Dawanpedia Entry',
    type: 'relationship',
    relationTo: 'dawanpediaEntries' as CollectionSlug,
    admin: {
      description: 'Link to another Dawanpedia entry if this source refers to an internal profile.',
    },
  },
  {
    name: 'verification',
    label: 'Verification',
    type: 'group',
    fields: [
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        defaultValue: 'unchecked',
        options: [
          { label: 'Unchecked', value: 'unchecked' },
          { label: 'Valid', value: 'valid' },
          { label: 'Broken', value: 'broken' },
        ],
      },
      {
        name: 'checkedAt',
        label: 'Checked At',
        type: 'date',
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
        admin: {
          rows: 2,
        },
      },
    ],
  },
]
