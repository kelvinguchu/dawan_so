import type { CollectionSlug, Field } from 'payload'
import { RelationshipFeature, UploadFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

const MAX_SUBSECTION_DEPTH = 4

interface RichTextFieldArgs {
  name: string
  label: string
  required?: boolean
}

export const createRichTextField = ({
  name,
  label,
  required = false,
}: RichTextFieldArgs): Field => ({
  name,
  label,
  type: 'richText',
  required,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      UploadFeature({
        collections: {
          media: {
            fields: [],
          },
        },
      }),
      RelationshipFeature({
        enabledCollections: ['dawanpediaEntries' as CollectionSlug],
      }),
    ],
  }),
})

const createSubsectionFields = (depth = 1): Field[] => {
  const fields: Field[] = [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      admin: {
        width: '50%',
      },
    },
    {
      name: 'anchorId',
      label: 'Anchor Override',
      type: 'text',
      admin: {
        description: 'Leave blank to auto-generate from the title.',
        width: '50%',
      },
    },
    {
      name: 'summary',
      label: 'Summary',
      type: 'textarea',
      admin: {
        rows: 3,
      },
    },
    createRichTextField({
      name: 'body',
      label: 'Body',
    }),
  ]

  if (depth < MAX_SUBSECTION_DEPTH) {
    fields.push({
      name: 'subsections',
      label: 'Nested Subsections',
      type: 'array',
      admin: {
        description: 'Optional nested subsections for deeper structures.',
      },
      fields: createSubsectionFields(depth + 1),
    })
  }

  return fields
}

export const createSectionMetaFields = (): Field[] => [
  {
    name: 'title',
    label: 'Section Title',
    type: 'text',
    required: true,
    admin: {
      width: '50%',
    },
  },
  {
    name: 'anchorId',
    label: 'Anchor Override',
    type: 'text',
    admin: {
      description: 'Leave blank to auto-generate from the title.',
      width: '50%',
    },
  },
  {
    name: 'summary',
    label: 'Summary',
    type: 'textarea',
    admin: {
      rows: 2,
    },
  },
]

export const createSubsectionsField = (): Field => ({
  name: 'subsections',
  label: 'Subsections',
  type: 'array',
  admin: {
    description: 'Optional nested subsections.',
  },
  fields: createSubsectionFields(1),
})
