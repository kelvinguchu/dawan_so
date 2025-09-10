import React from 'react'
import type { Metadata } from 'next'
import TermsAndConditions from '@/components/terms/TermsAndConditions'

export const metadata: Metadata = {
  title: 'Shuruudaha iyo Xaaladaha | Dawan TV',
  description:
    'Shuruudaha iyo Xaaladaha Dawan TV — Ka baro shuruucda adeegga, akoonnada isticmaalaha, siyaasadaha rukummada, iyo tilmaamaha isticmaalka la aqbali karo ee adeegga Dawan TV ee Soomaaliya.',
  openGraph: {
    title: 'Shuruudaha iyo Xaaladaha | Dawan TV',
    description:
      'Shuruudaha iyo Xaaladaha Dawan TV — Sharraxaad ku saabsan shuruucda adeegga, akoonnada isticmaalaha, siyaasadaha rukummada, iyo isticmaalka la aqbali karo ee gudaha Soomaaliya.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shuruudaha iyo Xaaladaha | Dawan TV',
    description:
      'Shuruudaha iyo Xaaladaha Dawan TV — Faahfaahin ku saabsan shuruucda adeegga iyo isticmaalka ee Soomaaliya.',
  },
}

const TermsAndConditionsPage: React.FC = () => {
  return <TermsAndConditions />
}

export default TermsAndConditionsPage
