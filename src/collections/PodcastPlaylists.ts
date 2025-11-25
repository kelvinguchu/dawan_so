import { CollectionConfig } from 'payload'
import slugify from 'slugify'

export const PodcastPlaylists: CollectionConfig = {
  slug: 'podcastPlaylists',
  admin: {
    useAsTitle: 'name',
    group: 'Podcast Hub',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Playlist Name',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
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
      name: 'image',
      type: 'upload',
      required: true,
      relationTo: 'media',
      label: 'Playlist Image',
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
  ],
}
