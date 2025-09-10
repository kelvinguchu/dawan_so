import React from 'react'
import type { Metadata } from 'next'
import { AboutHero } from '@/components/about/AboutHero'
import { AboutContent } from '@/components/about/AboutContent'
import { OurPlatforms } from '@/components/about/OurPlatforms'

export const metadata: Metadata = {
  title: 'Nagu Saabsan - Dawan Media Group',
  description:
    'Ka baro Dawan Media Group — shirkad warbaahineed firfircoon oo la aasaasay 2023, oo diiradda saarta Soomaaliya iyo Geeska Afrika, kana soo tebisa warar, falanqayn iyo sheekooyin dhaqan.',
  openGraph: {
    title: 'Nagu Saabsan - Dawan Media Group',
    description:
      'Ujeedkeennu waa in aan xog-ogaalino, ka qayb-galno, isla markaana aan isku xirno bulshooyinka Soomaaliya iyo Geeska Afrika.',
    type: 'website',
    locale: 'so_SO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nagu Saabsan - Dawan Media Group',
    description:
      'Ka baro himiladeenna iyo howlaha aan u qabanno bulshada Soomaaliya iyo Geeska Afrika.',
  },
  keywords: [
    'Dawan TV',
    'Dawan Media Group',
    'Wararka Soomaaliya',
    'Geeska Afrika',
    'Saxaafadda Afrika',
    'Aragtiyo',
    'Raad-raac',
    'U Taagan',
  ],
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <AboutHero />

      <AboutContent />

      <OurPlatforms />
    </div>
  )
}
