import { Block } from 'payload'

export const Embed: Block = {
  slug: 'embed',
  labels: {
    singular: 'Embed',
    plural: 'Embeds',
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      label: 'Embed URL or HTML Code',
      required: true,
      admin: {
        description:
          'Enter either a URL to embed OR paste the embed HTML code from platforms like Twitter, YouTube, etc.',
        placeholder:
          'https://www.youtube.com/watch?v=... OR <blockquote class="twitter-tweet">...</blockquote>',
        rows: 4,
      },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Embed content is required'

        const trimmedValue = value.trim()

        // Check if it's HTML (starts with < and ends with >)
        if (trimmedValue.startsWith('<') && trimmedValue.endsWith('>')) {
          // Basic HTML validation - check for common embed patterns
          const hasValidEmbedTags =
            trimmedValue.includes('<iframe') ||
            trimmedValue.includes('<blockquote') ||
            trimmedValue.includes('<embed') ||
            trimmedValue.includes('<object')

          if (!hasValidEmbedTags) {
            return 'HTML embed code should contain iframe, blockquote, embed, or object tags'
          }

          return true
        }

        // If not HTML, validate as URL
        try {
          new URL(trimmedValue)
          return true
        } catch {
          return 'Please enter a valid URL or HTML embed code'
        }
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      admin: {
        description: 'Optional title for the embedded content',
        placeholder: 'e.g., Amazing Video Title',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Caption',
      admin: {
        description: 'Optional caption or description for the embedded content',
        rows: 3,
      },
    },
  ],
}
