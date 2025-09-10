import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      {
        headers: {
          'User-Agent': 'Dawan-TV-WebApp/1.0 (https://www.dawan.so)',
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Nominatim API error:', errorText)
      throw new Error(`Geocoding failed with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in reverse geocoding proxy:', error)
    return NextResponse.json({ error: 'Failed to fetch location name' }, { status: 500 })
  }
}
