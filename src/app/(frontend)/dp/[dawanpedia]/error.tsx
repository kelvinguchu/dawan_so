'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: Readonly<ErrorProps>) {
  useEffect(() => {
    console.error('Dawanpedia page error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#b01c14]/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-[#b01c14]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
          <p className="text-gray-600">
            We encountered an error while loading this entry. Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2 bg-[#b01c14] hover:bg-[#8a1610]">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {error.digest && <p className="text-xs text-gray-400">Error ID: {error.digest}</p>}
      </div>
    </div>
  )
}
