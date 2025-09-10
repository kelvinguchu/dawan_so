'use client'

import React from 'react'

interface CopyButtonProps {
  text: string
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }

  return (
    <button className="text-gray-400 hover:text-white transition-colors" onClick={handleCopy}>
      Koobiye
    </button>
  )
}
