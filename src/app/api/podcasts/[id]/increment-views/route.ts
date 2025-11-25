import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Podcast ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const podcast = await payload.findByID({
      collection: 'podcasts',
      id,
    })

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 })
    }

    const currentPlays = (podcast.playCount as number) || 0
    const newPlayCount = currentPlays + 1

    await payload.update({
      collection: 'podcasts',
      id,
      data: {
        playCount: newPlayCount,
      },
    })

    return NextResponse.json({
      success: true,
      playCount: newPlayCount,
    })
  } catch (error) {
    console.error('Error incrementing play count:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to increment play count',
      },
      { status: 500 },
    )
  }
}
