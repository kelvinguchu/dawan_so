import { CollectionConfig } from 'payload'

export const NotificationLogs: CollectionConfig = {
  slug: 'notification-logs',
  admin: {
    useAsTitle: 'sentAt',
    description: 'Log of sent global push notifications for rate limiting.',
    hidden: true,
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    create: () => true, // Allow server-side creation
    update: () => false,
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'type',
      type: 'text',
      required: true,
    },
    {
      name: 'sentAt',
      type: 'date',
      required: true,
    },
    {
      name: 'timeBlock',
      type: 'select',
      options: [
        { label: 'Morning', value: 'morning' },
        { label: 'Afternoon', value: 'afternoon' },
        { label: 'Evening', value: 'evening' },
      ],
      required: true,
    },
    {
      name: 'articleSlug',
      type: 'text',
    },
  ],
}
