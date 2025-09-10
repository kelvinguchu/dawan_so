'use client'

import React from 'react'
import { BiLogoTwitter, BiLogoFacebook, BiLogoYoutube, BiLogoTiktok } from 'react-icons/bi'

interface SocialIconsProps {
  className?: string
  iconSize?: number
}

const SocialIcons: React.FC<SocialIconsProps> = ({
  className = 'hidden md:flex items-center space-x-4',
  iconSize = 16,
}) => {
  return (
    <div className={className}>
      <a
        href="https://youtube.com/@dawanafrica?si=MeDNmWJDGkFWiF45"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-[#b01c14] transition-colors"
      >
        <BiLogoYoutube size={iconSize} />
      </a>
      <a
        href="https://x.com/dawanafrica?s=11&t=cGgYbc_v8C1zcdmiZHSiRg"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-[#b01c14] transition-colors"
      >
        <BiLogoTwitter size={iconSize} />
      </a>
      <a
        href="https://www.facebook.com/share/1DLeMnVa2e/?mibextid=wwXIfr"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-[#b01c14] transition-colors"
      >
        <BiLogoFacebook size={iconSize} />
      </a>
      <a
        href="https://www.tiktok.com/@dawanafrica?_t=ZS-8wXUI4l8QKX&_r=1"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-[#b01c14] transition-colors"
      >
        <BiLogoTiktok size={iconSize} />
      </a>
    </div>
  )
}

export default SocialIcons
