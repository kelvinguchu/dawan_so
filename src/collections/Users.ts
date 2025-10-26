import type { CollectionConfig } from 'payload'
import {
  generateVerificationEmailHTML,
  generateVerificationEmailSubject,
} from '@/templates/verification-email'
import {
  generateForgotPasswordEmailHTML,
  generateForgotPasswordEmailSubject,
} from '@/templates/forgot-password-email'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: {
      generateEmailHTML: generateVerificationEmailHTML,
      generateEmailSubject: generateVerificationEmailSubject,
    },
    forgotPassword: {
      generateEmailHTML: generateForgotPasswordEmailHTML,
      generateEmailSubject: generateForgotPasswordEmailSubject,
    },
  },
  admin: {
    useAsTitle: 'email',
    group: 'User Management',
    defaultColumns: ['name', 'email', 'roles', 'subscriptionTier', 'isEmailVerified', 'createdAt'],
    listSearchableFields: ['name', 'email'],
    description:
      'Manage user accounts and roles for the blog platform. Assign content creator roles to enable post submission workflow.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      access: {
        read: () => true, // Name is publicly readable
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      unique: true,
      access: {
        read: ({ req }) => {
          // Only logged-in users can read email addresses
          return Boolean(req.user)
        },
      },
    },
    {
      name: 'profilePicture',
      type: 'upload',
      relationTo: 'media',
      label: "User's profile picture.",
      maxDepth: 1,
      admin: {
        description: 'Upload a profile picture for the user.',
      },
      access: {
        read: ({ req }) => {
          // Only logged-in users can see profile pictures
          return Boolean(req.user)
        },
      },
    },
    {
      name: 'roles',
      type: 'select',
      label: 'User Roles',
      hasMany: true,
      defaultValue: ['user'],
      options: [
        { label: '👑 Admin', value: 'admin' },
        { label: '📊 Analyst', value: 'analyst' },
        { label: '✍️ Columnist', value: 'columnist' },
        { label: '📰 Reporter', value: 'reporter' },
        { label: '🤝 Contributor', value: 'contributor' },
        { label: '👤 User', value: 'user' },
      ],
      admin: {
        description:
          'Select the roles for this user. Content creators can write posts, admins can approve them.',
      },
      access: {
        read: () => true, // Roles are publicly readable
        create: ({ req }) => {
          const user = req.user
          return Boolean(user?.roles?.includes('admin'))
        },
        update: ({ req }) => {
          const user = req.user
          return Boolean(user?.roles?.includes('admin'))
        },
      },
    },
    {
      name: 'subscriptionTier',
      type: 'select',
      label: 'Subscription Tier',
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Premium', value: 'premium' },
      ],
      admin: {
        description: 'User subscription level for premium content access.',
      },
      access: {
        read: ({ req }) => {
          // Only logged-in users can see subscription info
          return Boolean(req.user)
        },
      },
    },
    {
      name: 'isEmailVerified',
      type: 'checkbox',
      label: 'Has the user verified their email address?',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Automatically updated when user verifies their email.',
      },
      access: {
        read: ({ req }) => {
          return Boolean(req.user)
        },
      },
    },
    {
      name: 'likedPosts',
      type: 'relationship',
      relationTo: 'blogPosts',
      hasMany: true,
      label: 'Liked Posts',
      admin: {
        readOnly: true,
      },
      access: {
        read: ({ req, doc }) => {
          // Users can only see their own liked posts
          return Boolean(req.user && req.user.id === doc?.id)
        },
      },
    },
    {
      name: 'favoritedPosts',
      type: 'relationship',
      relationTo: 'blogPosts',
      hasMany: true,
      label: 'Favorited Posts',
      admin: {
        readOnly: true,
      },
      access: {
        read: ({ req, doc }) => {
          // Users can only see their own favorited posts
          return Boolean(req.user && req.user.id === doc?.id)
        },
      },
    },
  ],
  hooks: {
    beforeLogin: [
      async ({ user }) => {
        if (!user._verified || !user.isEmailVerified) {
          throw new Error(
            'Please verify your email address before signing in. Check your email for a verification link.',
          )
        }
        return user
      },
    ],
    beforeChange: [
      ({ data, req: _req, operation: _operation }) => {
        if (data._verified !== undefined) {
          data.isEmailVerified = data._verified
        }
        return data
      },
    ],
  },
  access: {
    create: () => true,

    // Allow public reads; sanitize in afterRead
    read: () => true,

    update: ({ req }) => {
      const user = req.user
      if (!user) return false

      if (user.roles?.includes('admin')) {
        return true
      }

      return { id: { equals: user.id } }
    },

    delete: ({ req }) => {
      const user = req.user
      return Boolean(user?.roles?.includes('admin'))
    },
  },
}
