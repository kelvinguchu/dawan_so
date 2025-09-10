'use client'

import React from 'react'

interface ErrorFallbackProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export default function ErrorFallback({
  title = 'Waxbaa qaldamay',
  message = 'Khalad ayaa dhacay. Fadlan mar dambe isku day.',
  onRetry,
}: ErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={handleRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Isku day mar kale
        </button>
      </div>
    </div>
  )
} 
