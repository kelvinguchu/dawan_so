import { CollectionConfig } from 'payload'

export const PushSubscriptions: CollectionConfig = {
  slug: 'push-subscriptions',
  admin: {
    useAsTitle: 'endpoint',
    description: 'Stores user subscriptions for push notifications.',
    hidden: true,
  },
  fields: [
    {
      name: 'endpoint',
      type: 'text',
      label: 'Endpoint URL',
      required: true,
      unique: true,
    },
    {
      name: 'keys',
      type: 'group',
      label: 'Subscription Keys',
      fields: [
        {
          name: 'p256dh',
          type: 'text',
          label: 'p256dh Key',
          required: true,
        },
        {
          name: 'auth',
          type: 'text',
          label: 'Auth Key',
          required: true,
        },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'User',
      index: true,
    },
  ],
}
