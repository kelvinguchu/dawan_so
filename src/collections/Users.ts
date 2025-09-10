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

    read: ({ req }) => {
      const user = req.user
      if (!user) return false

      if (user.roles?.includes('admin')) {
        return true
      }

      if (
        user.roles?.some((role: string) =>
          ['analyst', 'columnist', 'reporter', 'contributor'].includes(role),
        )
      ) {
        return true
      }

      return { id: { equals: user.id } }
    },

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
