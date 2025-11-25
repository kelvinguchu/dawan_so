import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '@/payload.config'
import { Newsletter, NewsletterCampaign } from '@/payload-types'
import crypto from 'crypto'
import DOMPurify from 'isomorphic-dompurify'

interface SendNewsletterOptions {
  campaignId: string
  isTest?: boolean
  testEmails?: string[]
}

interface NewsletterRecipient {
  email: string
  firstName?: string | null
  lastName?: string | null
  unsubscribeToken?: string
}

// Lexical rich text node types
interface LexicalNode {
  type: string
  text?: string
  children?: LexicalNode[]
  bold?: boolean
  italic?: boolean
  underline?: boolean
  url?: string
  tag?: string
  [key: string]: unknown
}

interface LexicalContent {
  root: {
    type: string
    children: LexicalNode[]
    direction: ('ltr' | 'rtl') | null
    format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
    indent: number
    version: number
  }
  [k: string]: unknown
}

export class NewsletterSender {
  private payload!: Payload

  private constructor() {}

  static async create(): Promise<NewsletterSender> {
    const instance = new NewsletterSender()
    await instance.initializePayload()
    return instance
  }

  private async initializePayload() {
    this.payload = await getPayload({ config })
  }

  async getRecipients(): Promise<NewsletterRecipient[]> {
    const whereClause = {
      status: { equals: 'subscribed' },
    }

    const allRecipients: NewsletterRecipient[] = []
    let currentPage = 1
    const pageSize = 1000
    let hasNextPage = true

    while (hasNextPage) {
      try {

        const response = await this.payload.find({
          collection: 'newsletter',
          where: whereClause,
          limit: pageSize,
          page: currentPage,
        })

        const pageRecipients = response.docs.map((subscriber: Newsletter) => ({
          email: subscriber.email,
          firstName: subscriber.firstName,
          lastName: subscriber.lastName,
          unsubscribeToken: this.generateUnsubscribeToken(subscriber.email),
        }))

        allRecipients.push(...pageRecipients)

        hasNextPage = response.hasNextPage
        currentPage++

        if (hasNextPage) {
          await this.delay(50)
        }
      } catch (error) {
        console.error(`Error fetching recipients page ${currentPage}:`, error)
        throw new Error(
          `Failed to fetch newsletter recipients on page ${currentPage}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }

    return allRecipients
  }

  async sendCampaign(options: SendNewsletterOptions): Promise<{
    success: boolean
    sentCount: number
    failedCount: number
    errors: string[]
  }> {
    try {
      const campaign = await this.payload.findByID({
        collection: 'newsletterCampaigns',
        id: options.campaignId,
      })

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      if (campaign.status !== 'draft' && campaign.status !== 'send_now') {
        throw new Error('Campaign must be in draft or send_now status to send')
      }

      let recipients: NewsletterRecipient[]

      if (options.isTest && options.testEmails) {
        recipients = options.testEmails.map((email) => ({ email }))
      } else {
        recipients = await this.getRecipients()
      }

      const results = await this.sendToRecipients(campaign, recipients, options.isTest)

      return {
        success: results.failedCount === 0,
        ...results,
      }
    } catch (error) {
      throw error
    }
  }

  private async sendToRecipients(
    campaign: NewsletterCampaign,
    recipients: NewsletterRecipient[],
    isTest: boolean = false,
  ): Promise<{
    sentCount: number
    failedCount: number
    errors: string[]
  }> {
    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    const htmlContent = this.convertRichTextToHTML(campaign.content)
    const unsubscribeFooter = this.getUnsubscribeFooter()

    for (const recipient of recipients) {
      try {
        const personalizedSubject = this.personalizeContent(campaign.subject, recipient)
        const personalizedHTML = this.personalizeContent(htmlContent + unsubscribeFooter, recipient)

        await this.payload.sendEmail({
          to: recipient.email,
          subject: isTest ? `[TEST] ${personalizedSubject}` : personalizedSubject,
          html: personalizedHTML,
        })

        sentCount++
      } catch (error) {
        failedCount++
        const maskedEmail = this.maskEmail(recipient.email)
        const errorMessage = `Failed to send to ${maskedEmail}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
        errors.push(errorMessage)
        console.error(errorMessage)
      }

      if (!isTest) {
        await this.delay(100)
      }
    }

    return { sentCount, failedCount, errors }
  }

  private convertRichTextToHTML(
    richTextContent: LexicalContent | string | null | undefined,
  ): string {
    if (!richTextContent) return ''

    let htmlContent = ''

    if (typeof richTextContent === 'string') {
      htmlContent = richTextContent
    } else if (richTextContent.root && richTextContent.root.children) {
      htmlContent = this.processRichTextNodes(richTextContent.root.children)
    }

    return DOMPurify.sanitize(htmlContent, {
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
        'b',
        'i',
        'ul',
        'ol',
        'li',
        'a',
        'img',
        'table',
        'thead',
        'tbody',
        'tr',
        'td',
        'th',
        'div',
        'span',
        'blockquote',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height'],
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ADD_ATTR: ['target', 'rel'],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      KEEP_CONTENT: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      SANITIZE_DOM: true,
      FORCE_BODY: false,
      SAFE_FOR_TEMPLATES: false,
    })
  }

  private processRichTextNodes(nodes: LexicalNode[]): string {
    return nodes
      .map((node) => {
        if (node.type === 'paragraph') {
          const content = node.children ? this.processRichTextNodes(node.children) : ''
          return `<p>${content}</p>`
        }

        if (node.type === 'heading') {
          const content = node.children ? this.processRichTextNodes(node.children) : ''
          const level = node.tag || 'h2'
          return `<${level}>${content}</${level}>`
        }

        if (node.type === 'text') {
          let text = node.text || ''
          if (node.bold) text = `<strong>${text}</strong>`
          if (node.italic) text = `<em>${text}</em>`
          if (node.underline) text = `<u>${text}</u>`
          return text
        }

        if (node.type === 'link') {
          const content = node.children ? this.processRichTextNodes(node.children) : ''
          return `<a href="${node.url}">${content}</a>`
        }

        return node.text || ''
      })
      .join('')
  }

  private escapeHtml(text: string): string {
    const htmlEscapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    }

    return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char])
  }

  private personalizeContent(content: string, recipient: NewsletterRecipient): string {
    const safeFirstName = this.escapeHtml(recipient.firstName || '')
    const safeLastName = this.escapeHtml(recipient.lastName || '')
    const safeEmail = this.escapeHtml(recipient.email)
    const safeUnsubscribeToken = encodeURIComponent(recipient.unsubscribeToken || '')

    return content
      .replace(/{{firstName}}/g, safeFirstName)
      .replace(/{{lastName}}/g, safeLastName)
      .replace(/{{email}}/g, safeEmail)
      .replace(/{{unsubscribeToken}}/g, safeUnsubscribeToken)
  }

  private getUnsubscribeFooter(): string {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dawan.so'
    return `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>
          You received this email because you subscribed to Dawan TV newsletter.
          <br>
          <a href="${baseUrl}/api/newsletter/unsubscribe?token={{unsubscribeToken}}" style="color: #b01c14;">
            Unsubscribe
          </a> |
          <a href="${baseUrl}" style="color: #b01c14;">
            Visit our website
          </a>
        </p>
        <p>
          Dawan TV<br>
          Marinio Rd, Mogadishu, Somalia
        </p>
      </div>
    `
  }

  private generateUnsubscribeToken(email: string): string {
    const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET
    if (!secret) {
      throw new Error('UNSUBSCRIBE_TOKEN_SECRET environment variable is required')
    }
    const timestamp = Date.now().toString()
    const payload = `${email}:${timestamp}`

    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const signature = hmac.digest('hex')

    const token = Buffer.from(`${payload}:${signature}`).toString('base64url')

    return token
  }

  public static verifyUnsubscribeToken(email: string, token: string): boolean {
    try {
      const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET
      if (!secret) {
        console.warn('UNSUBSCRIBE_TOKEN_SECRET environment variable is missing')
        return false
      }

      const decoded = Buffer.from(token, 'base64url').toString()
      const parts = decoded.split(':')

      if (parts.length !== 3) return false

      const [tokenEmail, timestamp, signature] = parts

      if (tokenEmail !== email) return false

      const tokenTime = parseInt(timestamp)
      const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
      if (Date.now() - tokenTime > maxAge) return false

      const payload = `${tokenEmail}:${timestamp}`
      const hmac = crypto.createHmac('sha256', secret)
      hmac.update(payload)
      const expectedSignature = hmac.digest('hex')

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      )
    } catch (error) {
      console.error('Token verification error:', error)
      return false
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@')
    if (!localPart || !domain) return '***@***.***'

    const maskedLocal =
      localPart.length <= 2
        ? '*'.repeat(localPart.length)
        : localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]

    const domainParts = domain.split('.')
    const maskedDomain =
      domainParts.length > 1
        ? domainParts[0][0] +
          '*'.repeat(Math.max(0, domainParts[0].length - 1)) +
          '.' +
          domainParts.slice(1).join('.')
        : '*'.repeat(domain.length)

    return `${maskedLocal}@${maskedDomain}`
  }
}

let newsletterSenderInstance: NewsletterSender | null = null

export const getNewsletterSender = async (): Promise<NewsletterSender> => {
  if (!newsletterSenderInstance) {
    newsletterSenderInstance = await NewsletterSender.create()
  }
  return newsletterSenderInstance
}
