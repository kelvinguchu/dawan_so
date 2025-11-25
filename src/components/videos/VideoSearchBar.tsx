'use client'

import React, { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface VideoSearchBarProps {
  defaultValue?: string
}

export const VideoSearchBar: React.FC<VideoSearchBarProps> = ({ defaultValue = '' }) => {
  const [value, setValue] = useState<string>(defaultValue)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pushWithParams = (params: URLSearchParams) => {
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (value.trim()) {
      params.set('search', value.trim())
    } else {
      params.delete('search')
    }
    pushWithParams(params)
  }

  const handleClear = () => {
    setValue('')
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.delete('search')
    pushWithParams(params)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Raadi fiidiyowyo"
          className="w-full pl-10 pr-9"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Tirtir raadinta"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" className="bg-[#b01c14] text-white hover:bg-[#8e140f]">
        <Search className="h-5 w-5" />
        <span className="sr-only">Raadi fiidiyowyo</span>
      </Button>
    </form>
  )
}
