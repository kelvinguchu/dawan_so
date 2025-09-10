'use client'

import React, { useEffect, useState, FormEvent, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/store/searchStore'

interface SearchInputProps {
  placeholder?: string
  className?: string
  inputClassName?: string
  buttonClassName?: string
  redirectPath?: string
  autoFocus?: boolean
  isHeaderSearch?: boolean
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Raadi cinwaanada maqaallada...',
  className = '',
  inputClassName = '',
  buttonClassName = '',
  redirectPath = '/news',
  autoFocus = false,
  isHeaderSearch = false,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const isEditingRef = useRef(false)

  const { searchTerm, searchField, setSearchTerm } = useSearchStore()

  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    setInputValue(urlSearch || searchTerm || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const prevSearchParamRef = useRef(searchParams.get('search') || '')
  useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || ''

    if (currentUrlSearch !== prevSearchParamRef.current && !isEditingRef.current) {
      setInputValue(currentUrlSearch)
    }

    prevSearchParamRef.current = currentUrlSearch
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isEditingRef.current = true
    setInputValue(e.target.value)
  }

  const handleClearSearch = () => {
    setInputValue('')

    if (inputRef.current) {
      inputRef.current.focus()
    }

    isEditingRef.current = true
  }

  const performSearch = () => {
    isEditingRef.current = false

    if (inputValue.trim() === searchTerm) {
      return
    }

    setSearchTerm(inputValue.trim())

    const params = new URLSearchParams(searchParams.toString())

    if (inputValue && inputValue.trim()) {
      params.set('search', inputValue.trim())
      params.set('searchField', searchField)
    } else {
      params.delete('search')
      params.delete('searchField')
    }

    const url = `${redirectPath}?${params.toString()}`
    router.push(url)
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    performSearch()
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      if (document.activeElement?.tagName !== 'BUTTON') {
        isEditingRef.current = false
      }
    }, 100)
  }

  return (
    <form onSubmit={handleFormSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        <Input
          ref={inputRef}
          name="search"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => {
            isEditingRef.current = true
          }}
          className={`pl-9 sm:pl-10 pr-9 ${inputClassName}`}
          autoFocus={autoFocus}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button
        type="submit"
        size={isHeaderSearch ? 'sm' : 'default'}
        className={`${buttonClassName} ${isHeaderSearch ? 'rounded-full bg-[#b01c14] hover:bg-[#238ca3]' : 'bg-[#b01c14] hover:bg-[#238ca3]'}`}
      >
        <Search className={`${isHeaderSearch ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <span className="sr-only">Raadi</span>
      </Button>
    </form>
  )
}
