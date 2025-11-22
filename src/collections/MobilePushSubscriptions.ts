import { CollectionConfig } from 'payload'

export const MobilePushSubscriptions: CollectionConfig = {
  slug: 'mobile-push-subscriptions',
  admin: {
    useAsTitle: 'token',
    description: 'Stores Expo push tokens for mobile app notifications.',
    hidden: true,
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    create: () => true,
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'token',
      type: 'text',
      label: 'Expo Push Token',
      required: true,
      unique: true,
    },
    {
      name: 'platform',
      type: 'select',
      options: [
        { label: 'iOS', value: 'ios' },
        { label: 'Android', value: 'android' },
        { label: 'Web', value: 'web' },
      ],
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'User',
      index: true,
    },
    {
      name: 'lastActive',
      type: 'date',
      label: 'Last Active',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' || operation === 'update') {
          return {
            ...data,
            lastActive: new Date().toISOString(),
          }
        }
        return data
      },
    ],
  },
}
