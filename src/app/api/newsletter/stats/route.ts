import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    let authResult
    try {
      authResult = await payload.auth({ headers: request.headers })
    } catch (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ error: 'Invalid authentication credentials' }, { status: 401 })
    }

    const { user } = authResult
    if (!user || !user.roles?.includes('admin')) {
      return NextResponse.json(
        {
          error: 'Unauthorized access: Administrator privileges required',
          details: 'Only admin users can access newsletter statistics',
        },
        { status: 403 },
      )
    }

    const [subscribedCount, unsubscribedCount, bouncedCount, cleanedCount, totalCampaigns] =
      await Promise.all([
        payload.count({
          collection: 'newsletter',
          where: { status: { equals: 'subscribed' } },
        }),
        payload.count({
          collection: 'newsletter',
          where: { status: { equals: 'unsubscribed' } },
        }),
        payload.count({
          collection: 'newsletter',
          where: { status: { equals: 'bounced' } },
        }),
        payload.count({
          collection: 'newsletter',
          where: { status: { equals: 'cleaned' } },
        }),
        payload.count({
          collection: 'newsletterCampaigns',
          where: { status: { equals: 'sent' } },
        }),
      ])

    const response = {
      memberCount: subscribedCount,
      unsubscribeCount: unsubscribedCount,
      cleanedCount: cleanedCount,
      bouncedCount: bouncedCount,
      campaignsSent: totalCampaigns,
      audienceName: 'Dawan TV Newsletter',
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Newsletter stats error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available')

    return NextResponse.json(
      {
        error: 'Failed to fetch newsletter statistics',
        details: 'An internal error occurred. Please try again later.',
      },
      { status: 500 },
    )
  }
}
