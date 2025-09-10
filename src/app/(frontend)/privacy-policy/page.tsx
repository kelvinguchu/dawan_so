import React from 'react'
import type { Metadata } from 'next'
import PrivacyPolicy from '@/components/privacy-policy/PrivacyPolicy'

export const metadata: Metadata = {
  title: 'Siyaasadda Arrimaha Gaarka ah | Dawan TV',
  description:
    'Siyaasadda Arrimaha Gaarka ah ee Dawan TV — Baro sida aan u ururino, u isticmaalno, una ilaalino xogtaada gaarka ah, annagoo diiradda saaraya isticmaaleyaasha ku sugan Soomaaliya.',
  openGraph: {
    title: 'Siyaasadda Arrimaha Gaarka ah | Dawan TV',
    description:
      'Siyaasadda Arrimaha Gaarka ah ee Dawan TV — Sida xogtaada loo ururiyo loona ilaaliyo gudaha Soomaaliya.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siyaasadda Arrimaha Gaarka ah | Dawan TV',
    description:
      'Siyaasadda Arrimaha Gaarka ah ee Dawan TV — Baro sida aan u maamulno xogtaada gaarka ah ee Soomaaliya.',
  },
}

const PrivacyPolicyPage: React.FC = () => {
  return <PrivacyPolicy />
}

export default PrivacyPolicyPage
