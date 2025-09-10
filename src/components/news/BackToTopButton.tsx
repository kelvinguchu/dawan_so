'use client'

import React from 'react'

interface BackToTopButtonProps {
  className?: string
  children: React.ReactNode
}

export const BackToTopButton: React.FC<BackToTopButtonProps> = ({ className, children }) => {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button onClick={handleBackToTop} className={className}>
      {children}
    </button>
  )
}
