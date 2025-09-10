'use client'

import React from 'react'
import './loader.css'

interface LoadingProps {
  fullScreen?: boolean
  message?: string
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message = 'Loading article...',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : 'py-6'}`}
    >
      <div className="loader"></div>
      {message && <p className="text-sm text-gray-600 animate-pulse">{message}</p>}
    </div>
  )
}
