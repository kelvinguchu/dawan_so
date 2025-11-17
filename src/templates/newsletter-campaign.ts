import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import DOMPurify from 'isomorphic-dompurify'

interface NewsletterCampaignTemplateParams {
  content: unknown
  subject: string
  subscriberEmail: string
  unsubscribeUrl: string
  siteUrl?: string
  topArticles?: NewsletterTopArticle[]
}

interface NewsletterTopArticle {
  title: string
  summary?: string
  url: string
  views?: number
  imageUrl?: string
}

interface LexicalNode {
  type?: string
  text?: string
  children?: LexicalNode[]
  tag?: string
  fields?: { url?: string }
  url?: string
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;')
}

function enhanceHTMLWithStyling(html: string): string {
  return html
    .replaceAll('<p>', '<p style="margin: 8px 0; color: #333; line-height: 1.6; font-size: 16px;">')
    .replaceAll(
      '<h1>',
      '<h1 style="font-size: 28px; font-weight: bold; margin: 16px 0 8px 0; color: #b01c14;">',
    )
    .replaceAll(
      '<h2>',
      '<h2 style="font-size: 24px; font-weight: bold; margin: 14px 0 6px 0; color: #b01c14;">',
    )
    .replaceAll(
      '<h3>',
      '<h3 style="font-size: 20px; font-weight: bold; margin: 12px 0 6px 0; color: #333;">',
    )
    .replaceAll(
      '<h4>',
      '<h4 style="font-size: 18px; font-weight: bold; margin: 10px 0 4px 0; color: #333;">',
    )
    .replaceAll(
      '<h5>',
      '<h5 style="font-size: 16px; font-weight: bold; margin: 8px 0 4px 0; color: #333;">',
    )
    .replaceAll(
      '<h6>',
      '<h6 style="font-size: 14px; font-weight: bold; margin: 8px 0 4px 0; color: #333;">',
    )
    .replaceAll('<ul>', '<ul style="margin: 8px 0; padding-left: 20px;">')
    .replaceAll('<ol>', '<ol style="margin: 8px 0; padding-left: 20px;">')
    .replaceAll('<li>', '<li style="margin: 2px 0; color: #333; line-height: 1.6;">')
    .replaceAll(
      '<blockquote>',
      '<blockquote style="margin: 8px 0; padding: 12px; border-left: 4px solid #b01c14; background-color: #f8f9fa; font-style: italic; color: #555;">',
    )
    .replaceAll(
      /<hr\s*\/?>/g,
      '<hr style="margin: 12px 0; border: none; border-top: 2px solid #e9ecef;" />',
    )
    .replaceAll('<a ', '<a style="color: #b01c14; text-decoration: underline;" ')
    .replaceAll(
      '<code>',
      '<code style="background-color: #f1f1f1; padding: 2px 4px; border-radius: 3px; font-family: monospace;">',
    )
}

function convertLexicalNodesToText(nodes: LexicalNode[]): string {
  return nodes
    .map((node) => {
      return convertLexicalNodeToText(node)
    })
    .join('')
}

const lexicalNodeHandlers: Record<string, (node: LexicalNode) => string> = {
  paragraph: (node) => {
    const paragraphContent = node.children ? convertLexicalNodesToText(node.children) : ''
    return `${paragraphContent}\n`
  },
  heading: (node) => {
    const headingContent = node.children ? convertLexicalNodesToText(node.children) : ''
    const level = node.tag?.replace('h', '') || '1'
    const prefixMap: Record<string, string> = {
      '1': '# ',
      '2': '## ',
      '3': '### ',
    }
    const prefix = prefixMap[level] || ''
    return `${prefix}${headingContent}\n\n`
  },
  list: (node) => {
    const listContent = node.children ? convertLexicalNodesToText(node.children) : ''
    return `${listContent}\n`
  },
  listitem: (node) => {
    const listItemContent = node.children ? convertLexicalNodesToText(node.children) : ''
    return `• ${listItemContent.replace(/\n+$/, '')}\n`
  },
  quote: (node) => {
    const quoteContent = node.children ? convertLexicalNodesToText(node.children) : ''
    return `> ${quoteContent.replace(/\n+$/, '')}\n\n`
  },
  horizontalrule: () => '─────────────────────────────────────\n\n',
  link: (node) => {
    const linkContent = node.children ? convertLexicalNodesToText(node.children) : ''
    const url = node.fields?.url || node.url || '#'
    return `${linkContent} (${url})`
  },
  linebreak: () => '\n',
}

function convertLexicalNodeToText(node: LexicalNode): string {
  if (!node) return ''

  if (node.type === 'text') {
    return node.text || ''
  }

  const handler = node.type ? lexicalNodeHandlers[node.type] : undefined
  if (handler) {
    return handler(node)
  }

  if (node.children) {
    return convertLexicalNodesToText(node.children)
  }

  return ''
}

function buildTopStoriesHtml(articles: NewsletterTopArticle[] | undefined): string {
  if (!articles || articles.length === 0) {
    return ''
  }

  const cards = articles
    .map((article) => {
      const safeTitle = escapeHtml(article.title)
      const safeSummary = escapeHtml(
        article.summary || 'Akhriso warbixinta oo dhammaystiran boggayaga.',
      )
      const safeUrl = escapeHtml(article.url)
      const image = article.imageUrl
        ? `<img src="${escapeHtml(article.imageUrl)}" alt="${safeTitle}" style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />`
        : ''
      const viewsBadge =
        typeof article.views === 'number'
          ? `<span style="font-size: 12px; color: #6c757d;">${article.views.toLocaleString('en-US')} views</span>`
          : ''

      return `
        <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          ${image}
          <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a;">${safeTitle}</h3>
          <p style="margin: 0 0 12px 0; color: #444; font-size: 14px; line-height: 1.5;">${safeSummary}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <a href="${safeUrl}" style="color: #b01c14; font-weight: bold; text-decoration: none;">Akhri Warbixinta →</a>
            ${viewsBadge}
          </div>
        </div>
      `
    })
    .join('')

  return `
    <section style="margin-bottom: 32px;">
      <p style="text-transform: uppercase; letter-spacing: 1px; font-size: 12px; color: #6c757d; margin-bottom: 12px;">5-ta War ee Maanta</p>
      ${cards}
    </section>
  `
}

function buildTopStoriesText(articles: NewsletterTopArticle[] | undefined): string {
  if (!articles || articles.length === 0) return ''

  const lines = ['TOP STORIES', '================================']

  for (const [index, article] of articles.entries()) {
    const viewsText = typeof article.views === 'number' ? ` (Views: ${article.views})` : ''
    lines.push(
      `${index + 1}. ${article.title}`,
      article.summary ? article.summary : 'Akhriso warbixinta oo dhammaystiran boggayaga.',
      `Link: ${article.url}${viewsText}`,
      '',
    )
  }

  return lines.join('\n')
}

export async function renderNewsletterCampaignHtml({
  content,
  subject,
  subscriberEmail,
  unsubscribeUrl,
  siteUrl,
  topArticles,
}: NewsletterCampaignTemplateParams): Promise<string> {
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
  const escapedSubscriberEmail = escapeHtml(subscriberEmail)
  const sanitizedUnsubscribeUrl = escapeHtml(unsubscribeUrl)
  const resolvedSiteUrl = siteUrl || 'https://dawan.so'
  const normalizedSiteUrl = resolvedSiteUrl.replace(/\/$/, '')
  const preferencesUrl = `${normalizedSiteUrl}/newsletter`
  const topStoriesSection = buildTopStoriesHtml(topArticles)
  const currentYear = new Date().getFullYear()

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
            <img src="${normalizedSiteUrl}/logo.png" alt="Dawan TV" />
            <h1>${escapedSubject}</h1>
        </div>
        
        <!-- Main Content -->
        <div class="content">
          ${topStoriesSection}
          ${htmlContent}
            
            <div class="cta-section">
                <a href="${normalizedSiteUrl}" class="cta-button">Visit Our Website</a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Dawan TV</strong></p>
            <p>Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya iyo Geeska Afrika</p>
            <p>
                <a href="mailto:info@dawan.so">info@dawan.so</a> | 
                <a href="${normalizedSiteUrl}">www.dawan.so</a>
            </p>
            <p>Marinio Rd, Mogadishu, Somalia | +252628881171</p>
            
            <div class="unsubscribe">
                <p>This email was sent to ${escapedSubscriberEmail}</p>
                <p>
                    <a href="${sanitizedUnsubscribeUrl}">Unsubscribe</a> | 
                    <a href="${preferencesUrl}">Update Preferences</a>
                </p>
                <p>© ${currentYear} Dawan TV. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim()
}

export function renderNewsletterCampaignText({
  content,
  subject,
  subscriberEmail,
  unsubscribeUrl,
  siteUrl,
  topArticles,
}: NewsletterCampaignTemplateParams): string {
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

  const resolvedSiteUrl = siteUrl || 'https://dawan.so'
  const normalizedSiteUrl = resolvedSiteUrl.replace(/\/$/, '')
  const preferencesUrl = `${normalizedSiteUrl}/newsletter`
  const topStoriesText = buildTopStoriesText(topArticles)
  const currentYear = new Date().getFullYear()

  return `
Dawan TV NEWSLETTER
${subject}
================================

${topStoriesText}

${textContent}

Visit our website: ${normalizedSiteUrl}

================================
ABOUT Dawan TV

Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya iyo Geeska Afrika

Contact Us:
Email: info@dawan.so
Website: ${normalizedSiteUrl}
Address: Marinio Rd, Mogadishu, Somalia
Phone: +252628881171

================================
SUBSCRIPTION DETAILS

This email was sent to: ${subscriberEmail}

Manage your subscription:
• Unsubscribe: ${unsubscribeUrl}
• Update preferences: ${preferencesUrl}

© ${currentYear} Dawan TV. All rights reserved.
  `.trim()
}
