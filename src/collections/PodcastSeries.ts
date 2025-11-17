import { CollectionConfig } from 'payload'
import slugify from 'slugify'

export const PodcastSeries: CollectionConfig = {
  slug: 'podcastSeries',
  admin: {
    useAsTitle: 'name',
    group: 'Audio Hub',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Series Name',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            return data?.name ? slugify(data.name, { lower: true, strict: true }) : value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
  ],
}
