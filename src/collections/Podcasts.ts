import type { CollectionConfig } from 'payload'
import slugify from 'slugify'
import { parseFile, parseBuffer } from 'music-metadata'

interface UploadedFile {
  tempFilePath?: string
  path?: string
}

const extractDurationFromUrl = async (url: string): Promise<number | null> => {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const arrayBuf = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuf)
    const { format } = await parseBuffer(buffer)
    return typeof format.duration === 'number' ? Math.round(format.duration) : null
  } catch (err) {
    console.error('Unable to fetch/parse audio metadata:', err)
    return null
  }
}

const extractAudioDuration = async (file: UploadedFile): Promise<number | null> => {
  try {
    const filePath = file.tempFilePath || file.path
    if (!filePath) return null
    const { format } = await parseFile(filePath, { duration: true })
    return typeof format.duration === 'number' ? Math.round(format.duration) : null
  } catch (err) {
    console.error('Unable to parse audio metadata:', err)
    return null
  }
}

export const Podcasts: CollectionConfig = {
  slug: 'podcasts',
  defaultSort: '-createdAt',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
    update: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
    delete: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Podcast Title',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            return data?.title ? slugify(data.title, { lower: true, strict: true }) : value
          },
        ],
      },
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
    },
    {
      name: 'audioFile',
      type: 'upload',
      relationTo: 'media',
      label: 'Audio File',
      required: true,
      filterOptions: {
        mimeType: { contains: 'audio' },
      },
    },
    {
      name: 'series',
      type: 'relationship',
      relationTo: 'podcastSeries',
      label: 'Series',
      admin: {
        allowCreate: true,
        position: 'sidebar',
      },
    },
    {
      name: 'episodeNumber',
      type: 'number',
      label: 'Episode Number',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'duration',
      type: 'number',
      label: 'Duration (seconds)',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      validate: (val: unknown) => {
        const value = val as number | undefined | null
        if (value !== undefined && value !== null && value < 0) {
          return 'Duration must be positive'
        }
        return true
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
      name: 'peopleInvolved',
      type: 'array',
      label: 'People Involved',
      minRows: 1,

      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          label: 'Role',
          options: [
            { label: 'Host', value: 'host' },
            { label: 'Co-Host', value: 'co-host' },
            { label: 'Guest', value: 'guest' },
            { label: 'Interviewer', value: 'interviewer' },
            { label: 'Producer', value: 'producer' },
            { label: 'Editor', value: 'editor' },
            { label: 'Sound Engineer', value: 'sound-engineer' },
            { label: 'Moderator', value: 'moderator' },
          ],
          defaultValue: 'host',
          required: true,
        },
        {
          name: 'bio',
          type: 'textarea',
          label: 'Brief Bio',
        },
      ],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published Date',
      admin: {
        position: 'sidebar',
        date: {
          displayFormat: 'MMMM do, yyyy',
        },
      },
      defaultValue: () => new Date(),
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      label: 'Published',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'playCount',
      type: 'number',
      label: 'Play Count',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
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
    },
    {
      name: 'externalLinks',
      type: 'array',
      label: 'External Links',

      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Link Title',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
          validate: (val: unknown) => {
            const value = val as string
            if (value && !value.match(/^https?:\/\/.+/)) {
              return 'Please enter a valid URL starting with http:// or https://'
            }
            return true
          },
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description',
        },
      ],
    },
  ],
  endpoints: [
    {
      path: '/increment-play/:id',
      method: 'post',
      handler: async (req) => {
        const idFromParams = req.routeParams?.id
        if (typeof idFromParams !== 'string') {
          return Response.json({ error: 'Invalid podcast ID format' }, { status: 400 })
        }

        try {
          const currentPodcast = await req.payload.findByID({
            collection: 'podcasts',
            id: idFromParams,
          })

          const result = await req.payload.update({
            collection: 'podcasts',
            id: idFromParams,
            data: {
              playCount: (currentPodcast.playCount || 0) + 1,
            },
          })

          return Response.json({
            success: true,
            playCount: result.playCount,
            message: 'Play count incremented successfully',
          })
        } catch (error) {
          req.payload.logger.error(
            `Error incrementing play count for podcast ${idFromParams}: ${error instanceof Error ? error.message : String(error)}`,
          )

          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  ],
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'series',
      'episodeNumber',
      'duration',
      'isPublished',
      'featured',
      'playCount',
      'createdAt',
    ],
    listSearchableFields: ['title', 'description'],
    group: 'Content Management',
    pagination: {
      defaultLimit: 20,
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (data && data.series) {
          if (!data.episodeNumber) {
            try {
              const countResult = await req.payload.count({
                collection: 'podcasts',
                where: {
                  series: { equals: data.series },
                },
              })
              data.episodeNumber = (countResult.totalDocs || 0) + 1
            } catch (err) {
              req.payload.logger.error('Error auto-setting episode number', err)
            }
          }
        } else if (data) {
          data.episodeNumber = null
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req }) => {
        if (!data?.duration) {
          if (req.file) {
            const dur = await extractAudioDuration(req.file)
            if (dur) data.duration = dur
          } else if (data?.audioFile) {
            try {
              const mediaDoc = await req.payload.findByID({
                collection: 'media',
                id:
                  typeof data.audioFile === 'string'
                    ? data.audioFile
                    : (data.audioFile.id ?? data.audioFile),
              })
              if (mediaDoc?.url) {
                let absoluteUrl = mediaDoc.url as string
                if (!absoluteUrl.startsWith('http')) {
                  const base =
                    process.env.SERVER_BASE_URL ||
                    (req.payload?.config as { serverURL?: string })?.serverURL ||
                    `http://localhost:${process.env.PORT ?? 3000}`
                  absoluteUrl = `${base}${absoluteUrl.startsWith('/') ? absoluteUrl : `/${absoluteUrl}`}`
                }

                const remoteDur = await extractDurationFromUrl(absoluteUrl)
                if (remoteDur) data.duration = remoteDur
              }
            } catch (err) {
              req.payload.logger.error('Error extracting remote audio duration', err)
            }
          }
        }
        return data
      },
    ],
  },
}
