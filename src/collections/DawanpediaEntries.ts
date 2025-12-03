import type { Access, CollectionConfig, CollectionSlug, FieldHook, PayloadRequest } from 'payload'
import slugify from 'slugify'

import { createRichTextField } from '../blocks/dawanpedia/common.ts'
import { referenceFields } from './dawanpedia/referenceFields.ts'

const ADMIN_ROLE = 'admin' as const
const CONTENT_CREATOR_ROLES = ['analyst', 'columnist', 'reporter', 'contributor'] as const
const DAWANPEDIA_SLUG = 'dawanpediaEntries' as CollectionSlug

const isAdmin = (user: PayloadRequest['user']): boolean => {
  return Boolean(user?.roles?.includes(ADMIN_ROLE))
}

const isContentCreator = (user: PayloadRequest['user']): boolean => {
  return Boolean(
    user?.roles?.some((role) =>
      CONTENT_CREATOR_ROLES.includes(role as (typeof CONTENT_CREATOR_ROLES)[number]),
    ),
  )
}

const isAuthorized = (user: PayloadRequest['user']): boolean => {
  return isAdmin(user) || isContentCreator(user)
}

const toSlug = (value: string): string => {
  return slugify(value, { lower: true, strict: true })
}

const slugFieldHook: FieldHook = ({ value, siblingData }) => {
  if (siblingData?.name && typeof siblingData.name === 'string') {
    return toSlug(siblingData.name)
  }

  return value
}

const validateUrl = (value: unknown) => {
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

const createAccess: Access = ({ req }) => {
  return isAuthorized(req.user)
}

const readAccess: Access = () => true

const updateAccess: Access = ({ req }) => {
  return isAdmin(req.user)
}

const deleteAccess: Access = ({ req }) => {
  return isAdmin(req.user)
}

export const DawanpediaEntries: CollectionConfig = {
  slug: DAWANPEDIA_SLUG,
  labels: {
    singular: 'Dawanpedia Entry',
    plural: 'Dawanpedia Entries',
  },
  access: {
    create: createAccess,
    read: readAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Knowledge Base',
    defaultColumns: ['name', 'entryType', 'status', 'publishedDate', 'updatedAt'],
    description: 'Structured people and business profiles for the Dawanpedia knowledge hub.',
  },
  fields: [
    {
      name: 'name',
      label: 'Entry Title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from the title.',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [slugFieldHook],
      },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'review' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedDate',
      label: 'Published Date',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Required when the entry status is set to Published.',
      },
      validate: (
        value: unknown,
        options?: {
          siblingData?: {
            status?: string
          }
        },
      ) => {
        const status = options?.siblingData?.status

        if (status === 'published' && !value) {
          return 'Published entries require a published date.'
        }

        return true
      },
    },
    {
      name: 'entryType',
      label: 'Entry Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Person', value: 'person' },
        { label: 'Business', value: 'business' },
      ],
    },
    {
      name: 'primaryImage',
      label: 'Primary Image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional profile image shown alongside the header.',
      },
    },
    {
      name: 'profileFacts',
      label: 'Profile Facts',
      type: 'array',
      admin: {
        description: 'Quick facts displayed under the profile header.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          label: 'Label',
          type: 'text',
          required: true,
        },
        createRichTextField({
          name: 'value',
          label: 'Value',
          required: true,
        }),
      ],
    },
    {
      name: 'sections',
      label: 'Content Sections',
      type: 'array',
      required: true,
      admin: {
        description: 'Stack of narrative sections for this entry.',
      },
      fields: [
        {
          name: 'heading',
          label: 'Heading',
          type: 'text',
          required: true,
        },
        createRichTextField({
          name: 'content',
          label: 'Body',
          required: true,
        }),
      ],
    },
    {
      name: 'references',
      label: 'References',
      type: 'array',
      admin: {
        description: 'Canonical references for this entry.',
        initCollapsed: true,
      },
      fields: referenceFields,
    },
    {
      name: 'externalResources',
      label: 'External Resources',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
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
          validate: validateUrl,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'relatedContent',
      label: 'Related Content',
      type: 'group',
      fields: [
        {
          name: 'blogPosts',
          label: 'Blog Posts',
          type: 'relationship',
          relationTo: 'blogPosts',
          hasMany: true,
        },
        {
          name: 'relatedEntries',
          label: 'Related Dawanpedia Entries',
          type: 'relationship',
          relationTo: DAWANPEDIA_SLUG,
          hasMany: true,
          admin: {
            allowCreate: false,
            description: 'Optional cross-links to other relevant Dawanpedia entries.',
          },
        },
      ],
    },
    {
      name: 'editorialNotes',
      label: 'Editorial Notes',
      type: 'textarea',
      admin: {
        rows: 4,
        description: 'Internal notes for editors and reviewers.',
      },
    },
    {
      name: 'changelog',
      label: 'Changelog',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          label: 'Label',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
        },
        {
          name: 'updatedAt',
          label: 'Updated At',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'updatedBy',
          label: 'Updated By',
          type: 'relationship',
          relationTo: 'users',
        },
      ],
    },
    {
      name: 'workflow',
      label: 'Workflow',
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'maintainer',
          label: 'Maintainer',
          type: 'relationship',
          relationTo: 'users',
          filterOptions: () => ({
            or: [
              { roles: { contains: 'admin' } },
              { roles: { contains: 'analyst' } },
              { roles: { contains: 'columnist' } },
              { roles: { contains: 'reporter' } },
              { roles: { contains: 'contributor' } },
            ],
          }),
          admin: {
            allowCreate: false,
            description: 'Primary editor responsible for this entry.',
          },
          hooks: {
            beforeChange: [
              ({ req, value, operation }) => {
                if (value) {
                  return value
                }

                if (operation === 'create' && req.user) {
                  return req.user.id
                }

                return value
              },
            ],
          },
        },
        {
          name: 'lastReviewedBy',
          label: 'Last Reviewed By',
          type: 'relationship',
          relationTo: 'users',
          filterOptions: () => ({
            or: [
              { roles: { contains: 'admin' } },
              { roles: { contains: 'analyst' } },
              { roles: { contains: 'columnist' } },
              { roles: { contains: 'reporter' } },
              { roles: { contains: 'contributor' } },
            ],
          }),
        },
        {
          name: 'lastReviewedAt',
          label: 'Last Reviewed At',
          type: 'date',
        },
        {
          name: 'potentialDuplicateOf',
          label: 'Potential Duplicate Of',
          type: 'relationship',
          relationTo: DAWANPEDIA_SLUG,
        },
        {
          name: 'duplicateConfidence',
          label: 'Duplicate Confidence',
          type: 'number',
          min: 0,
          max: 1,
          admin: {
            description: 'Optional 0-1 confidence score for duplicate detection.',
          },
        },
      ],
    },
  ],
}
