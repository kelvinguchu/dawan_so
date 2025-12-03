import Link from 'next/link'
import { FileQuestion, Home, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#b01c14]/10 flex items-center justify-center">
          <FileQuestion className="h-8 w-8 text-[#b01c14]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Entry Not Found</h1>
          <p className="text-gray-600">
            The Dawanpedia entry you&apos;re looking for doesn&apos;t exist or may have been
            removed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2 bg-[#b01c14] hover:bg-[#8a1610]">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/news" className="gap-2">
              <Search className="h-4 w-4" />
              Browse News
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
