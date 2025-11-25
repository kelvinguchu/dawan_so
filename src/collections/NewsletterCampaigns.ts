import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildUnsubscribeUrl } from '@/utils/unsubscribe'
import {
  renderNewsletterCampaignHtml,
  renderNewsletterCampaignText,
} from '@/templates/newsletter-campaign'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dawan.so'

interface CampaignArticleSnapshot {
  title: string
  url: string
  summary?: string
  views?: number
  imageUrl?: string
}

function extractTopArticles(topArticles: unknown): CampaignArticleSnapshot[] | undefined {
  if (!Array.isArray(topArticles)) return undefined

  const sanitized = topArticles
    .map((article) => {
      if (!article || typeof article !== 'object') return undefined
      const record = article as Record<string, unknown>
      const title = typeof record.title === 'string' ? record.title : undefined
      const url = typeof record.url === 'string' ? record.url : undefined
      if (!title || !url) return undefined

      return {
        title,
        url,
        summary: typeof record.summary === 'string' ? record.summary : undefined,
        views: typeof record.views === 'number' ? record.views : undefined,
        imageUrl: typeof record.imageUrl === 'string' ? record.imageUrl : undefined,
      }
    })
    .filter(Boolean) as CampaignArticleSnapshot[]

  return sanitized.length > 0 ? sanitized : undefined
}

function redactEmail(email: string): string {
  if (!email || typeof email !== 'string') return '[REDACTED]'
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return '[REDACTED]'
  const redactedLocal = localPart.substring(0, 2) + '*'.repeat(Math.max(0, localPart.length - 2))
  return `${redactedLocal}@${domain}`
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export const NewsletterCampaigns: CollectionConfig = {
  slug: 'newsletterCampaigns',
  labels: {
    singular: 'Newsletter Campaign',
    plural: 'Newsletter Campaigns',
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'status', 'digestDate', 'sentAt'],
    group: 'Marketing',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    create: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    update: ({ req: { user }, data }) => {
      const isAdmin = Boolean(user?.roles?.includes('admin'))
      const canEdit = !data?.status || data.status === 'draft' || data.status === 'send_now'
      return isAdmin && canEdit
    },
    delete: ({ req: { user } }) => {
      const isAdmin = Boolean(user?.roles?.includes('admin'))
      return isAdmin
    },
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req, previousDoc }) => {

        const isNewSendNow = operation === 'create' && doc.status === 'send_now'
        const isStatusChangedToSendNow =
          operation === 'update' && previousDoc?.status !== 'send_now' && doc.status === 'send_now'

        if (isNewSendNow || isStatusChangedToSendNow) {
          setImmediate(async () => {
            try {
              const subscribers = await req.payload.find({
                collection: 'newsletter',
                limit: 10000,
              })

              if (subscribers.docs.length === 0) {
                await req.payload.update({
                  collection: 'newsletterCampaigns',
                  id: doc.id,
                  data: {
                    status: 'failed' as const,
                    errorLog: 'No active subscribers found',
                    sentCount: 0,
                    failedCount: 0,
                  } as Record<string, unknown>,
                  context: { triggerAfterChange: false },
                  overrideAccess: true,
                })
                return
              }

              let sentCount = 0
              let failedCount = 0
              const errors: string[] = []

              const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
                const chunks: T[][] = []
                for (let i = 0; i < array.length; i += chunkSize) {
                  chunks.push(array.slice(i, i + chunkSize))
                }
                return chunks
              }

              const sendEmailToSubscriber = async (
                subscriber: { email: string },
                index: number,
                total: number,
              ) => {
                const redactedEmail = redactEmail(subscriber.email)

                const normalizedEmail = normalizeEmail(subscriber.email)
                let unsubscribeUrl: string

                try {
                  unsubscribeUrl = buildUnsubscribeUrl(subscriber.email)
                } catch (urlError) {
                  console.error(
                    `❌ Fatal error during unsubscribe URL generation for ${redactedEmail}:`,
                    urlError,
                  )
                  const errorMessage =
                    urlError instanceof Error ? urlError.message : 'Unknown error'
                  return {
                    success: false,
                    subscriber: redactedEmail,
                    error: `Unsubscribe URL generation failed: ${errorMessage}`,
                  }
                }

                try {
                  const campaignTopArticles = extractTopArticles(doc.topArticles)
                  const htmlContent = await renderNewsletterCampaignHtml({
                    content: doc.content,
                    subject: doc.subject,
                    subscriberEmail: normalizedEmail,
                    unsubscribeUrl,
                    siteUrl: SITE_URL,
                    topArticles: campaignTopArticles,
                  })
                  const textContent = renderNewsletterCampaignText({
                    content: doc.content,
                    subject: doc.subject,
                    subscriberEmail: normalizedEmail,
                    unsubscribeUrl,
                    siteUrl: SITE_URL,
                    topArticles: campaignTopArticles,
                  })

                  const emailResult = await req.payload.sendEmail({
                    to: subscriber.email,
                    subject: doc.subject,
                    html: htmlContent,
                    text: textContent,
                    replyTo: 'info@dawan.so',
                    headers: {
                      'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:info@dawan.so?subject=unsubscribe>`,
                      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                    },
                  })

                  if (emailResult === undefined) {
                    throw new Error(
                      'Email service not configured - check Resend API key and domain verification',
                    )
                  }

                  return { success: true, subscriber: redactedEmail }
                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                  return { success: false, subscriber: redactedEmail, error: errorMessage }
                }
              }

              const BATCH_SIZE = 10
              const subscriberBatches = chunkArray(subscribers.docs, BATCH_SIZE)

              for (let batchIndex = 0; batchIndex < subscriberBatches.length; batchIndex++) {
                const batch = subscriberBatches[batchIndex]

                const batchPromises = batch.map((subscriber, index) => {
                  const globalIndex = batchIndex * BATCH_SIZE + index
                  return sendEmailToSubscriber(subscriber, globalIndex, subscribers.docs.length)
                })

                const batchResults = await Promise.all(batchPromises)

                for (const result of batchResults) {
                  if (result.success) {
                    sentCount++
                  } else {
                    failedCount++
                    errors.push(`Failed to send to ${result.subscriber}: ${result.error}`)
                  }
                }

                if (batchIndex < subscriberBatches.length - 1) {
                  await new Promise((resolve) => setTimeout(resolve, 2000))
                }
              }

              const finalStatus: 'sent' | 'failed' = failedCount === 0 ? 'sent' : 'failed'
              const updateData = {
                status: finalStatus,
                sentAt: new Date().toISOString(),
                sentCount,
                failedCount,
                errorLog: errors.length > 0 ? errors.join('\n') : undefined,
              }

              await req.payload.update({
                collection: 'newsletterCampaigns',
                id: doc.id,
                data: updateData as Record<string, unknown>,
                context: { triggerAfterChange: false },
                overrideAccess: true,
              })
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error'

              try {
                await req.payload.update({
                  collection: 'newsletterCampaigns',
                  id: doc.id,
                  data: {
                    status: 'failed' as const,
                    errorLog: `Campaign error: ${errorMessage}`,
                    sentCount: 0,
                    failedCount: 0,
                  } as Record<string, unknown>,
                  context: { triggerAfterChange: false },
                  overrideAccess: true,
                })
              } catch (updateError) {
                console.error('📧 Failed to update campaign status:', updateError)
              }
            }
          })
        } else {
          console.log('📧 Hook conditions not met, skipping email processing')
        }
      },
    ],
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      label: 'Email Subject',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Email Content',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => {
          return defaultFeatures.filter((feature) => feature.key !== 'relationship')
        },
      }),
    },
    {
      name: 'topArticles',
      type: 'array',
      label: 'Top Articles Snapshot',
      admin: {
        description: 'Automatically populated each evening with the 5 most viewed stories.',
      },
      fields: [
        {
          name: 'post',
          type: 'relationship',
          relationTo: 'blogPosts',
          label: 'Source Article',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'summary',
          type: 'textarea',
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'views',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'imageUrl',
          type: 'text',
          admin: {
            description: 'Optional hero image URL for this article.',
          },
        },
      ],
    },
    {
      name: 'digestDate',
      type: 'date',
      label: 'Digest Date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'autoGenerated',
      type: 'checkbox',
      label: 'Auto Generated',
      admin: {
        position: 'sidebar',
        description: 'Indicates whether this campaign was prepared by the nightly job.',
      },
    },
    {
      name: 'lastGeneratedAt',
      type: 'date',
      label: 'Last Generated At',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'generationSummary',
      type: 'textarea',
      label: 'Generation Notes',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'send_now',
      admin: {
        condition: (data) => {
          return !data.status || data.status === 'draft' || data.status === 'send_now'
        },
        components: {
          Cell: './components/admin/StatusCell',
        },
      },
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Send Now', value: 'send_now' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        readOnly: true,
        condition: (data) => data.status === 'sent' || data.status === 'failed',
      },
    },
    {
      name: 'sentCount',
      type: 'number',
      label: 'Emails Sent',
      admin: {
        readOnly: true,
        condition: (data) => data.status === 'sent' || data.status === 'failed',
      },
    },
    {
      name: 'failedCount',
      type: 'number',
      label: 'Failed Emails',
      admin: {
        readOnly: true,
        condition: (data) =>
          data.status === 'failed' || (data.status === 'sent' && data.failedCount > 0),
      },
    },
    {
      name: 'errorLog',
      type: 'textarea',
      label: 'Error Log',
      admin: {
        readOnly: true,
        condition: (data) =>
          data.status === 'failed' || (data.errorLog && data.errorLog.length > 0),
      },
    },
  ],
}
