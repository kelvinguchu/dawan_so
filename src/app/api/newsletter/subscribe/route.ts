import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateWelcomeEmail } from '@/templates/welcome-email'
import { buildUnsubscribeUrl } from '@/utils/unsubscribe'

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is required')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false

  if (email.length > 254) return false

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (!emailRegex.test(email)) return false

  const parts = email.split('@')
  if (parts.length !== 2) return false

  const [local, domain] = parts

  if (local.length > 64 || local.length === 0) return false
  if (local.startsWith('.') || local.endsWith('.')) return false
  if (local.includes('..')) return false

  if (domain.length === 0) return false
  if (domain.startsWith('.') || domain.endsWith('.')) return false
  if (domain.includes('..')) return false

  const domainParts = domain.split('.')
  if (domainParts.some((part) => part.length > 63 || part.length === 0)) return false

  return true
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, source = 'website' } = await request.json()

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        {
          error: 'Please provide a valid email address',
        },
        { status: 400 },
      )
    }

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_AUDIENCE_KEY) {
      console.error('Missing Resend configuration:', {
        hasApiKey: !!process.env.RESEND_API_KEY,
        hasAudienceKey: !!process.env.RESEND_AUDIENCE_KEY,
      })
      return NextResponse.json({ error: 'Newsletter service configuration error' }, { status: 500 })
    }

    const payload = await getPayload({ config })

    try {
      await payload.create({
        collection: 'newsletter',
        data: {
          email: email.toLowerCase().trim(),
          firstName: firstName?.trim() || '',
          lastName: lastName?.trim() || '',
          source,
          subscribedAt: new Date().toISOString(),
        },
      })
    } catch (createError: unknown) {
      const errorMessage = createError instanceof Error ? createError.message : 'Unknown error'
      console.log('Subscriber creation failed, attempting to update existing:', errorMessage)

      try {
        const existingSubscriber = await payload.find({
          collection: 'newsletter',
          where: { email: { equals: email.toLowerCase().trim() } },
        })

        if (existingSubscriber.docs.length > 0) {
          // Existing subscriber found - continue to unified response
        } else {
          throw createError
        }
      } catch (fallbackError) {
        console.error(
          'Failed to find/update existing subscriber after creation failed:',
          fallbackError,
        )
        throw createError
      }
    }

    try {
      const resend = getResend()
      await resend.contacts.create({
        email: email.toLowerCase().trim(),
        firstName: firstName?.trim() || '',
        lastName: lastName?.trim() || '',
        unsubscribed: false,
        audienceId: process.env.RESEND_AUDIENCE_KEY,
      })
    } catch (resendError: unknown) {
      const errorMessage = resendError instanceof Error ? resendError.message : 'Unknown error'
      console.error('Failed to add contact to Resend audience:', {
        email,
        error: errorMessage,
        details: resendError,
      })

      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
      } else {
        // Other error, but we don't want to fail the entire subscription
      }
    }

    await sendWelcomeEmail(payload, email, firstName)

    // Generic response to prevent email enumeration
    return NextResponse.json({
      message:
        'Thank you for your interest! If the email address is valid, you will receive a confirmation shortly.',
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 },
    )
  }
}

async function sendWelcomeEmail(
  payload: Awaited<ReturnType<typeof getPayload>>,
  email: string,
  firstName?: string,
) {
  try {
    const { subject, html } = generateWelcomeEmail({ firstName, email })

    const unsubscribeUrl = buildUnsubscribeUrl(email)

    await payload.sendEmail({
      to: email,
      subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:info@dawan.so?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}
