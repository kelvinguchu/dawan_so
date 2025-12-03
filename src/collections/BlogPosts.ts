import type { CollectionConfig, CollectionAfterChangeHook, Access } from 'payload'
import { RichText } from '../blocks/richText/schema.ts'
import { Cover } from '../blocks/cover/schema.ts'
import { Image } from '../blocks/image/schema.ts'
import { Video } from '../blocks/video/schema.ts'
import { PDF } from '../blocks/pdf/schema.ts'
import { Embed } from '../blocks/embed/schema.ts'
import slugify from 'slugify'
import { sendNewPostNotification } from '../lib/push-notifications.ts'

const CONTENT_CREATOR_ROLES = ['analyst', 'columnist', 'reporter', 'contributor'] as const
const ADMIN_ROLE = 'admin' as const

type RoleUser = { roles?: string[] | null } | null

const isAdmin = (user: RoleUser): boolean => {
  return Boolean(user?.roles?.includes(ADMIN_ROLE))
}

const isContentCreator = (user: RoleUser): boolean => {
  return Boolean(
    user?.roles?.some((role: string) =>
      CONTENT_CREATOR_ROLES.includes(role as (typeof CONTENT_CREATOR_ROLES)[number]),
    ),
  )
}

const isAuthorizedUser = (user: RoleUser): boolean => {
  return isAdmin(user) || isContentCreator(user)
}

const mapBlogStatusToStagingStatus = (blogStatus: string): string => {
  switch (blogStatus) {
    case 'pending':
      return 'pending'
    case 'published':
      return 'published'
    default:
      return 'pending'
  }
}

const createAccess: Access = ({ req }) => {
  return isAuthorizedUser(req.user)
}

const readAccess = (({ req }) => {
  const user = req.user

  if (isAdmin(user)) {
    return true
  }

  if (isContentCreator(user)) {
    return {
      or: [
        { status: { equals: 'published' } },
        {
          and: [{ status: { equals: 'pending' } }, { author: { equals: user?.id } }],
        },
      ],
    }
  }

  return { status: { equals: 'published' } }
}) as Access

const updateAccess: Access = ({ req }) => {
  return isAdmin(req.user)
}

const deleteAccess: Access = ({ req }) => {
  return isAdmin(req.user)
}

const workflowAfterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
  context,
}) => {
  const user = req.user

  if (context?.skipWorkflowSync || context?.internalTask) {
    return doc
  }

  if (!isAuthorizedUser(user)) {
    return doc
  }

  try {
    if (operation === 'create' && doc.status === 'pending') {
      await req.payload.create({
        collection: 'staging',
        data: {
          blogPost: doc.id,
          status: 'pending',
          submittedBy: doc.author,
          submittedAt: new Date().toISOString(),
        },
        req,
      })
    }

    if (isAdmin(user) && operation === 'update' && doc.status !== previousDoc?.status) {
      const stagingResult = await req.payload.find({
        collection: 'staging',
        where: {
          blogPost: { equals: doc.id },
        },
        limit: 1,
      })

      if (stagingResult.totalDocs > 0) {
        const stagingDoc = stagingResult.docs[0]
        const stagingStatus = mapBlogStatusToStagingStatus(doc.status)

        const updateData: Record<string, unknown> = {
          status: stagingStatus,
          reviewedBy: user?.id,
        }

        if (stagingStatus === 'published') {
          updateData.reviewedAt = new Date().toISOString()
        }

        await req.payload.update({
          collection: 'staging',
          id: stagingDoc.id,
          data: updateData,
          req,
        })
      }
    }
  } catch (error) {
    console.error(`❌ [WORKFLOW] Error managing staging workflow:`, error)
    // Don't throw error to avoid breaking the main operation
  }

  return doc
}

const pushNotificationAfterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req: _req,
  context,
}) => {
  if (context?.skipWorkflowSync || context?.internalTask) {
    return doc
  }

  try {
    const isNewlyPublished =
      (operation === 'create' && doc.status === 'published') ||
      (operation === 'update' && doc.status === 'published' && previousDoc?.status !== 'published')

    if (isNewlyPublished) {
      setImmediate(async () => {
        try {
          await sendNewPostNotification(doc.id)
        } catch (_error) {
          // Silent fail
        }
      })
    }
  } catch (_error) {
    // Silent fail
  }

  return doc
}

export const BlogPost: CollectionConfig = {
  slug: 'blogPosts',
  defaultSort: '-createdAt',
  access: {
    create: createAccess,
    read: readAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        const hasAuthor = data?.author
        const hasManualReporter = data?.useManualReporter && data?.manualReporter?.name

        if (!hasAuthor && !hasManualReporter) {
          throw new Error(
            'Either an author must be selected or manual reporter information must be provided',
          )
        }

        return data
      },
    ],
    afterChange: [workflowAfterChangeHook, pushNotificationAfterChangeHook],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'This is automatically generated from the title.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            return data?.name ? slugify(data.name, { lower: true, strict: true }) : value
          },
        ],
      },
      required: true,
    },
    {
      name: 'articleUrl',
      type: 'text',
      label: 'Article URL',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Copy this link to share the article.',
        condition: (data) => Boolean(data?.slug),
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data?.slug) {
              return `https://www.dawan.so/news/${encodeURIComponent(data.slug)}`
            }
            return undefined
          },
        ],
      },
    },
    {
      name: 'statusDisplay',
      type: 'text',
      label: 'Status',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Current status of your post. Contact an admin to change this.',
        condition: (_data, _siblingData, { user }) => {
          return !isAdmin(user)
        },
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            return data?.status === 'published' ? '🚀 Published' : '⏳ Pending Review'
          },
        ],
      },
      access: {
        create: ({ req }) => isContentCreator(req.user),
        update: () => false,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'pending',
      options: [
        { label: '⏳ Pending Review', value: 'pending' },
        { label: '🚀 Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Change the publication status of this post.',
        condition: (_data, _siblingData, { user }) => {
          return isAdmin(user)
        },
      },
      access: {
        create: ({ req, data }) => {
          const user = req.user
          if (!user) return false

          if (isAdmin(user)) return true

          if (isContentCreator(user)) {
            return !data?.status || data.status === 'pending'
          }

          return false
        },
        update: ({ req }) => isAdmin(req.user),
      },
      required: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Layout',
      blocks: [RichText, Cover, Image, Video, PDF, Embed],
    },
    {
      name: 'articleAudio',
      type: 'upload',
      relationTo: 'articleAudio',
      label: 'Article Audio',
      admin: {
        position: 'sidebar',
        description: 'Optional narrated audio uploaded manually. You can add or replace later.',
      },
      filterOptions: {
        mimeType: { contains: 'audio' },
      },
    },
    {
      name: 'countryTags',
      type: 'select',
      label: 'Countries',
      hasMany: true,
      options: [
        { label: 'Caalami', value: 'International' },
        { label: 'Soomaaliya', value: 'Somalia' },
        { label: 'Kenya', value: 'Kenya' },
        { label: 'Jabuuti', value: 'Djibouti' },
        { label: 'Itoobiya', value: 'Ethiopia' },
        { label: 'Ereteriya', value: 'Eritrea' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Select countries related to this article.',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'blogCategories',
      hasMany: true,
      label: 'Categories',
      maxDepth: 1,
      admin: {
        position: 'sidebar',
        allowCreate: false,
      },
    },
    {
      name: 'useManualReporter',
      type: 'checkbox',
      label: 'Use Manual Reporter Info',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Check this to manually enter reporter details instead of selecting a user account.',
        condition: (_data, _siblingData, { user }) => {
          return isAdmin(user)
        },
      },
      access: {
        create: ({ req }) => isAdmin(req.user),
        update: ({ req }) => isAdmin(req.user),
      },
    },
    {
      name: 'manualReporter',
      type: 'group',
      label: 'Reporter Details',
      admin: {
        position: 'sidebar',
        description: 'Enter the details of the external reporter for this article.',
        condition: (data, _siblingData, { user }) => {
          return isAdmin(user) && data?.useManualReporter
        },
      },
      access: {
        create: ({ req }) => isAdmin(req.user),
        update: ({ req }) => isAdmin(req.user),
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Reporter Name',
          required: true,
          admin: {
            description: 'Full name of the reporter',
          },
        },
        {
          name: 'useCustomRole',
          type: 'checkbox',
          label: 'Use Custom Role',
          defaultValue: false,
          admin: {
            description:
              'Check this to enter a custom role instead of selecting from predefined options.',
          },
        },
        {
          name: 'role',
          type: 'select',
          label: 'Reporter Role',
          options: [
            { label: 'Reporter', value: 'reporter' },
            { label: 'Correspondent', value: 'correspondent' },
            { label: 'Freelance Journalist', value: 'freelance' },
            { label: 'Contributing Writer', value: 'contributor' },
            { label: 'Special Correspondent', value: 'special-correspondent' },
            { label: 'Field Reporter', value: 'field-reporter' },
            { label: 'Investigative Journalist', value: 'investigative' },
            { label: 'News Analyst', value: 'analyst' },
            { label: 'Senior Correspondent', value: 'senior-correspondent' },
            { label: 'Bureau Chief', value: 'bureau-chief' },
          ],
          defaultValue: 'reporter',
          admin: {
            condition: (_data, siblingData) => {
              if (siblingData.useCustomRole) {
                return false
              } else {
                return true
              }
            },
          },
        },
        {
          name: 'customRole',
          type: 'text',
          label: 'Custom Role Title',
          admin: {
            placeholder: 'e.g., Senior War Correspondent, Foreign Bureau Chief',
            description: 'Enter a custom role title for the reporter.',
            condition: (_data, siblingData) => {
              if (siblingData.useCustomRole) {
                return true
              } else {
                return false
              }
            },
          },
        },
      ],
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Author',
      admin: {
        position: 'sidebar',
        allowCreate: false,
        description:
          'Select an author from content creators and admins. Regular users are excluded.',
        condition: (data, _siblingData, _user) => {
          return !data?.useManualReporter
        },
        components: {
          Cell: '@/components/admin/cells/AuthorCell',
        },
      },
      filterOptions: () => {
        return {
          or: [
            { roles: { contains: 'admin' } },
            { roles: { contains: 'analyst' } },
            { roles: { contains: 'columnist' } },
            { roles: { contains: 'reporter' } },
            { roles: { contains: 'contributor' } },
          ],
        }
      },
      access: {
        create: ({ req, data }) => {
          const user = req.user
          if (!user) return false

          if (isAdmin(user)) return true

          return data?.author === user.id
        },
        update: ({ req, data }) => {
          const user = req.user
          if (!user) return false

          if (isAdmin(user)) {
            return true
          }

          if (isContentCreator(user)) {
            return data?.author === user.id
          }

          return false
        },
      },

      hooks: {
        beforeChange: [
          ({ req, data }) => {
            const user = req.user

            if (isContentCreator(user) && !isAdmin(user)) {
              return user?.id
            }

            return data?.author
          },
        ],
      },
    },
    {
      name: 'likes',
      type: 'number',
      label: 'Likes',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        update: ({ req }) => {
          const user = req.user
          if (!user) return false
          return !isAdmin(user)
        },
      },
      validate: (value: unknown) => {
        if (typeof value === 'number' && value < 0) {
          return 'Likes cannot be negative'
        }
        return true
      },
    },
    {
      name: 'favoritesCount',
      type: 'number',
      label: 'Favorites Count',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        update: ({ req }) => {
          const user = req.user
          if (!user) return false
          return !isAdmin(user)
        },
      },
      validate: (value: unknown) => {
        if (typeof value === 'number' && value < 0) {
          return 'Favorites count cannot be negative'
        }
        return true
      },
    },
    {
      name: 'views',
      type: 'number',
      label: 'Views',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        update: ({ req }) => isAdmin(req.user),
      },
      validate: (value: unknown) => {
        if (typeof value === 'number' && value < 0) {
          return 'Views cannot be negative'
        }
        return true
      },
    },
    {
      name: 'isEditorsPick',
      type: 'checkbox',
      label: "Editor's Pick",
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
      access: {
        update: ({ req }) => isAdmin(req.user),
      },
    },
    {
      name: 'featuredinhomepage',
      type: 'checkbox',
      label: 'Featured in Homepage',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Check this to feature this post on the homepage.',
      },
      access: {
        update: ({ req }) => isAdmin(req.user),
      },
    },
  ],

  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'status',
      'author',
      'categories',
      'countryTags',
      'views',
      'isEditorsPick',
      'featuredinhomepage',
      'updatedAt',
    ],
    listSearchableFields: ['name', 'slug'],
    group: 'Content Management',
    pagination: {
      defaultLimit: 20,
    },
    description: 'Manage blog posts and content.',
  },
}
