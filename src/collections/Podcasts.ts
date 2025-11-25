import type { CollectionConfig, PayloadRequest } from 'payload'
import slugify from 'slugify'
import type { PodcastAsset as PodcastAssetsDoc } from '../payload-types'

const PODCAST_ASSETS_SLUG = 'podcastAssets' as const
const HTTP_LINK_REGEX = /^https?:\/\/.+/

type RelationValue = string | number | { id?: string | number } | null | undefined

type PodcastHookData = {
  mediaType?: 'audio' | 'video' | null
  media?: RelationValue
  episodeNumber?: number | null
  playlist?: RelationValue
  [key: string]: unknown
}

const resolveRelationId = (value: RelationValue): string | null => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object') {
    if ('id' in value) {
      const identifier = value.id
      if (typeof identifier === 'string' || typeof identifier === 'number') {
        return String(identifier)
      }
    }
    if ('value' in value) {
      const identifier = (value as { value?: string | number }).value
      if (typeof identifier === 'string' || typeof identifier === 'number') {
        return String(identifier)
      }
    }
  }
  return null
}

const resolveMediaDoc = async (
  req: PayloadRequest,
  mediaFile: RelationValue,
): Promise<PodcastAssetsDoc | null> => {
  const mediaId = resolveRelationId(mediaFile)
  if (!mediaId) return null

  try {
    return (await req.payload.findByID({
      collection: PODCAST_ASSETS_SLUG,
      id: mediaId,
    })) as PodcastAssetsDoc | null
  } catch (err) {
    req.payload.logger.error(
      `Unable to resolve media document for id ${mediaId}: ${err instanceof Error ? err.message : String(err)}`,
    )
    return null
  }
}

const ensureEpisodeNumber = async ({
  data,
  req,
}: {
  data?: PodcastHookData
  req: PayloadRequest
}) => {
  if (!data) return data

  const playlistId = resolveRelationId(data.playlist)

  if (!playlistId) {
    data.episodeNumber = null
    return data
  }

  if (data.episodeNumber) return data

  try {
    const countResult = await req.payload.count({
      collection: 'podcasts',
      where: { playlist: { equals: playlistId } },
    })

    data.episodeNumber = (countResult.totalDocs || 0) + 1
  } catch (err) {
    req.payload.logger.error(
      `Error auto-setting episode number: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  return data
}

const syncMediaMetadata = async ({
  data,
  req,
}: {
  data?: PodcastHookData
  req: PayloadRequest
}) => {
  if (!data || !data.media) return data

  const mediaDoc = await resolveMediaDoc(req, data.media)
  if (!mediaDoc) return data

  // Sync Media Type
  if (mediaDoc.mimeType) {
    if (mediaDoc.mimeType.startsWith('audio/')) {
      data.mediaType = 'audio'
    } else if (mediaDoc.mimeType.startsWith('video/')) {
      data.mediaType = 'video'
    }
  }

  return data
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
      name: 'media',
      type: 'upload',
      relationTo: PODCAST_ASSETS_SLUG,
      label: 'Media File (Audio or Video)',
      required: true,
    },
    {
      name: 'mediaType',
      type: 'select',
      label: 'Media Type',
      options: [
        { label: 'Audio', value: 'audio' },
        { label: 'Video', value: 'video' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'playlist',
      type: 'relationship',
      relationTo: 'podcastPlaylists',
      label: 'Playlist',
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
      required: true,
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
      defaultValue: true,
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
            if (value && !HTTP_LINK_REGEX.exec(value)) {
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
      'playlist',
      'episodeNumber',
      'isPublished',
      'featured',
      'playCount',
      'createdAt',
    ],
    listSearchableFields: ['title', 'description'],
    group: 'Podcast Hub',
    pagination: {
      defaultLimit: 20,
    },
  },
  hooks: {
    beforeValidate: [async (args) => ensureEpisodeNumber(args)],
    beforeChange: [async (args) => syncMediaMetadata(args)],
  },
}
