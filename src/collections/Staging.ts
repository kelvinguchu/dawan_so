import type { CollectionConfig, Access } from 'payload'

type RoleUserWithId = { id?: string; roles?: string[] | null } | null

const isAdmin = (user: RoleUserWithId): boolean => {
  return Boolean(user?.roles?.includes('admin'))
}

const adminOnlyAccess: Access = ({ req }) => {
  return isAdmin(req.user)
}

export const Staging: CollectionConfig = {
  slug: 'staging',
  labels: {
    singular: 'Staging Review',
    plural: 'Staging Reviews',
  },
  admin: {
    useAsTitle: 'blogPost',
    defaultColumns: [
      'blogPost',
      'status',
      'submittedBy',
      'submittedAt',
      'reviewedBy',
      'reviewedAt',
    ],
    listSearchableFields: ['blogPost'],
    group: 'Content Management',
    pagination: {
      defaultLimit: 25,
    },
    description:
      'Review and approve blog posts submitted by content creators. Simple workflow for content approval.',
  },
  access: {
    // Only admins can access the staging collection
    create: adminOnlyAccess,
    read: adminOnlyAccess,
    update: adminOnlyAccess,
    delete: adminOnlyAccess,
  },
  fields: [
    {
      name: 'blogPost',
      type: 'relationship',
      relationTo: 'blogPosts',
      label: 'Blog Post',
      required: true,
      maxDepth: 1,
      admin: {
        allowCreate: false,
      },
      filterOptions: () => {
        return {
          status: {
            equals: 'pending',
          },
        }
      },
    },
    {
      name: 'postPreview',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/BlogPostPreview',
        },
        condition: (data) => {
          return Boolean(data?.blogPost)
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Review Status',
      defaultValue: 'pending',
      options: [
        { label: '⏳ Pending Review', value: 'pending' },
        { label: '🚀 Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
      required: true,
    },
    {
      name: 'submittedAt',
      type: 'date',
      label: 'Submitted At',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      access: {
        update: () => false,
      },
      hooks: {
        beforeChange: [
          ({ value, operation }) => {
            if (operation === 'create' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Submitted By',
      maxDepth: 1,
      admin: {
        readOnly: true,
        allowCreate: false,
      },
      access: {
        update: () => false,
      },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Reviewed By',
      maxDepth: 1,
      admin: {
        allowCreate: false,
      },
      hooks: {
        beforeChange: [
          ({ req, value, operation }) => {
            const user = req.user as RoleUserWithId
            if (user?.roles?.includes('admin') && operation === 'update' && !value) {
              return user.id
            }
            return value
          },
        ],
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      label: 'Reviewed At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ value, data, operation }) => {
            if (operation === 'update' && data?.status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'workflowHistory',
      type: 'array',
      label: 'Workflow History',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'action',
          type: 'text',
          required: true,
        },
        {
          name: 'performedBy',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'performedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'fromStatus',
          type: 'text',
        },
        {
          name: 'toStatus',
          type: 'text',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation, originalDoc }) => {
        const user = req.user as RoleUserWithId

        if (operation === 'update' && user) {
          const workflowEntry = {
            action: `Status changed to ${data.status}`,
            performedBy: user.id,
            performedAt: new Date(),
            fromStatus: originalDoc?.status ?? 'unknown',
            toStatus: data.status,
          }

          data.workflowHistory ??= []
          data.workflowHistory.push(workflowEntry)
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        const user = req.user as RoleUserWithId

        if (!user?.roles?.includes('admin') || !doc.blogPost) return doc

        const statusChanged = operation === 'update' && doc.status !== previousDoc?.status
        if (!statusChanged) return doc

        try {
          const blogPostId = typeof doc.blogPost === 'string' ? doc.blogPost : doc.blogPost?.id

          if (!blogPostId) {
            console.error('❌ [STAGING SYNC] No valid blog post ID found')
            return doc
          }

          let blogStatus: string
          switch (doc.status) {
            case 'pending':
              blogStatus = 'pending'
              break
            case 'published':
              blogStatus = 'published'
              break
            default:
              blogStatus = 'pending'
          }

          await (
            req.payload as unknown as { update: (options: unknown) => Promise<unknown> }
          ).update({
            collection: 'blogPosts',
            id: blogPostId,
            data: {
              status: blogStatus,
            },
            req,
            context: {
              skipWorkflowSync: true,
            },
          })
        } catch (error) {
          console.error(`❌ [STAGING SYNC] Error syncing status to blog post:`, error)
        }

        return doc
      },
    ],
  },
}
