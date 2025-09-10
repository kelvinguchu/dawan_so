import type { CollectionConfig } from 'payload'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import DOMPurify from 'isomorphic-dompurify'
import { buildUnsubscribeUrl } from '@/utils/unsubscribe'

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
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

async function generateEmailHTML(
  content: unknown,
  subject: string,
  subscriberEmail: string,
  unsubscribeUrl: string,
): Promise<string> {
  let htmlContent = ''

  if (content && typeof content === 'object' && 'root' in content) {
    try {
      htmlContent = await convertLexicalToHTMLAsync({
        data: content as Parameters<typeof convertLexicalToHTMLAsync>[0]['data'],
      })

      htmlContent = enhanceHTMLWithStyling(htmlContent)
      htmlContent = DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'p',
          'br',
          'strong',
          'em',
          'u',
          'i',
          'b',
          'ul',
          'ol',
          'li',
          'blockquote',
          'a',
          'img',
          'div',
          'span',
          'table',
          'thead',
          'tbody',
          'tr',
          'td',
          'th',
        ],
        ALLOWED_ATTR: [
          'href',
          'src',
          'alt',
          'title',
          'style',
          'target',
          'width',
          'height',
          'class',
          'id',
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
      })
    } catch (error) {
      console.error('Error converting Lexical to HTML:', error)
      htmlContent =
        '<p style="margin: 8px 0; color: #333; line-height: 1.6; font-size: 16px;">Content could not be processed</p>'
    }
  } else {
    htmlContent =
      '<p style="margin: 8px 0; color: #333; line-height: 1.6; font-size: 16px;">No content available</p>'
  }

  const escapedSubject = escapeHtml(subject)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${escapedSubject}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        /* Main styles */
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f4f4f4;
            font-family: 'Arial', sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .header {
            background-color: #0f172a;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header img {
            max-width: 180px;
            height: auto;
            display: block;
            margin: 0 auto 20px auto;
        }
        
        .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
            line-height: 1.2;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .content p {
            margin: 0 0 20px 0;
            color: #333333;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .content p:last-child {
            margin-bottom: 0;
        }
        
        .cta-section {
            text-align: center;
            margin: 30px 0;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #b01c14;
            color: #ffffff !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        
        .cta-button:hover {
            background-color: #1e90a6;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            margin: 8px 0;
            font-size: 14px;
            color: #6c757d;
            line-height: 1.4;
        }
        
        .footer a {
            color: #b01c14;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .unsubscribe {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
        }
        
        .unsubscribe p {
            font-size: 12px;
            color: #868e96;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }
            
            .header, .content, .footer {
                padding: 20px !important;
            }
            
            .header h1 {
                font-size: 24px !important;
            }
            
            .header img {
                max-width: 150px !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <img src="https://dawan.so/logo.png" alt="Dawan TV" />
            <h1>${escapedSubject}</h1>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            ${htmlContent}
            
            <div class="cta-section">
                <a href="https://dawan.so" class="cta-button">Visit Our Website</a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Dawan TV</strong></p>
            <p>Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya iyo Geeska Afrika</p>
            <p>
                <a href="mailto:info@dawan.so">info@dawan.so</a> | 
                <a href="https://dawan.so">www.dawan.so</a>
            </p>
            <p>Marinio Rd, Mogadishu, Somalia | +252628881171</p>
            
            <div class="unsubscribe">
                <p>This email was sent to ${subscriberEmail}</p>
                <p>
                    <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a> | 
                    <a href="https://dawan.so/newsletter">Update Preferences</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim()
}

function enhanceHTMLWithStyling(html: string): string {
  return html
    .replace(/<p>/g, '<p style="margin: 8px 0; color: #333; line-height: 1.6; font-size: 16px;">')
    .replace(
      /<h1>/g,
      '<h1 style="font-size: 28px; font-weight: bold; margin: 16px 0 8px 0; color: #b01c14;">',
    )
    .replace(
      /<h2>/g,
      '<h2 style="font-size: 24px; font-weight: bold; margin: 14px 0 6px 0; color: #b01c14;">',
    )
    .replace(
      /<h3>/g,
      '<h3 style="font-size: 20px; font-weight: bold; margin: 12px 0 6px 0; color: #333;">',
    )
    .replace(
      /<h4>/g,
      '<h4 style="font-size: 18px; font-weight: bold; margin: 10px 0 4px 0; color: #333;">',
    )
    .replace(
      /<h5>/g,
      '<h5 style="font-size: 16px; font-weight: bold; margin: 8px 0 4px 0; color: #333;">',
    )
    .replace(
      /<h6>/g,
      '<h6 style="font-size: 14px; font-weight: bold; margin: 8px 0 4px 0; color: #333;">',
    )
    .replace(/<ul>/g, '<ul style="margin: 8px 0; padding-left: 20px;">')
    .replace(/<ol>/g, '<ol style="margin: 8px 0; padding-left: 20px;">')
    .replace(/<li>/g, '<li style="margin: 2px 0; color: #333; line-height: 1.6;">')
    .replace(
      /<blockquote>/g,
      '<blockquote style="margin: 8px 0; padding: 12px; border-left: 4px solid #b01c14; background-color: #f8f9fa; font-style: italic; color: #555;">',
    )
    .replace(
      /<hr\s*\/?>/g,
      '<hr style="margin: 12px 0; border: none; border-top: 2px solid #e9ecef;" />',
    )
    .replace(/<a /g, '<a style="color: #b01c14; text-decoration: underline;" ')
    .replace(
      /<code>/g,
      '<code style="background-color: #f1f1f1; padding: 2px 4px; border-radius: 3px; font-family: monospace;">',
    )
}

interface LexicalNode {
  type?: string
  text?: string
  children?: LexicalNode[]
  tag?: string
  fields?: { url?: string }
  url?: string
}

function generateEmailText(
  content: unknown,
  subject: string,
  subscriberEmail: string,
  unsubscribeUrl: string,
): string {
  let textContent = ''

  if (content && typeof content === 'object' && 'root' in content) {
    const rootContent = content as { root?: { children?: LexicalNode[] } }
    if (rootContent.root?.children) {
      textContent = convertLexicalNodesToText(rootContent.root.children).trim()
    } else {
      textContent = 'No content available'
    }
  } else {
    textContent = 'No content available'
  }

  function convertLexicalNodesToText(nodes: LexicalNode[]): string {
    return nodes
      .map((node) => {
        return convertLexicalNodeToText(node)
      })
      .join('')
  }

  function convertLexicalNodeToText(node: LexicalNode): string {
    if (!node) return ''

    if (node.type === 'text') {
      return node.text || ''
    }

    switch (node.type) {
      case 'paragraph':
        const paragraphContent = node.children ? convertLexicalNodesToText(node.children) : ''
        return paragraphContent + '\n'

      case 'heading':
        const headingContent = node.children ? convertLexicalNodesToText(node.children) : ''
        const level = node.tag?.replace('h', '') || '1'
        const prefix = level === '1' ? '# ' : level === '2' ? '## ' : level === '3' ? '### ' : ''
        return prefix + headingContent + '\n\n'

      case 'list':
        const listContent = node.children ? convertLexicalNodesToText(node.children) : ''
        return listContent + '\n'

      case 'listitem':
        const listItemContent = node.children ? convertLexicalNodesToText(node.children) : ''
        return '• ' + listItemContent.replace(/\n+$/, '') + '\n'

      case 'quote':
        const quoteContent = node.children ? convertLexicalNodesToText(node.children) : ''
        return '> ' + quoteContent.replace(/\n+$/, '') + '\n\n'

      case 'horizontalrule':
        return '─────────────────────────────────────\n\n'

      case 'link':
        const linkContent = node.children ? convertLexicalNodesToText(node.children) : ''
        const url = node.fields?.url || node.url || '#'
        return `${linkContent} (${url})`

      case 'linebreak':
        return '\n'

      default:
        if (node.children) {
          return convertLexicalNodesToText(node.children)
        }
        return ''
    }
  }

  return `
Dawan TV NEWSLETTER
${subject}
================================

${textContent}

Visit our website: https://dawan.so

================================
ABOUT Dawan TV

Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya iyo Geeska Afrika

Contact Us:
Email: info@dawan.so
Website: https://dawan.so
Address: Marinio Rd, Mogadishu, Somalia
Phone: +252628881171

================================
SUBSCRIPTION DETAILS

This email was sent to: ${subscriberEmail}

Manage your subscription:
• Unsubscribe: ${unsubscribeUrl}
• Update preferences: https://dawan.so/newsletter

© ${new Date().getFullYear()} Dawan TV. All rights reserved.
  `.trim()
}

export const NewsletterCampaigns: CollectionConfig = {
  slug: 'newsletterCampaigns',
  labels: {
    singular: 'Newsletter Campaign',
    plural: 'Newsletter Campaigns',
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'status', 'sentAt'],
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
        console.log('📧 Newsletter hook triggered:', {
          operation,
          currentStatus: doc.status,
          previousStatus: previousDoc?.status,
          docId: doc.id,
        })

        const isNewSendNow = operation === 'create' && doc.status === 'send_now'
        const isStatusChangedToSendNow =
          operation === 'update' && previousDoc?.status !== 'send_now' && doc.status === 'send_now'

        console.log('📧 Hook conditions:', {
          isNewSendNow,
          isStatusChangedToSendNow,
        })

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
                console.log(`📧 Sending email ${index + 1}/${total} to: ${redactedEmail}`)

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
                  const htmlContent = await generateEmailHTML(
                    doc.content,
                    doc.subject,
                    normalizedEmail,
                    unsubscribeUrl,
                  )
                  const textContent = generateEmailText(
                    doc.content,
                    doc.subject,
                    normalizedEmail,
                    unsubscribeUrl,
                  )

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

                batchResults.forEach((result) => {
                  if (result.success) {
                    sentCount++
                  } else {
                    failedCount++
                    errors.push(`Failed to send to ${result.subscriber}: ${result.error}`)
                  }
                })

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
