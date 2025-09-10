'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSearchStore } from '@/store/searchStore'
import { BiLoaderAlt } from 'react-icons/bi'

interface CountryTabsProps {
  countries: string[]
  onCountrySelect: (country: string) => void
  isMobile?: boolean
}

const CountryTabs: React.FC<CountryTabsProps> = ({
  countries,
  onCountrySelect,
  isMobile = false,
}) => {
  const { searchTerm, searchField } = useSearchStore()
  const [loadingCountry, setLoadingCountry] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (countries.length === 0) {
    return null
  }

  const handleCountryClick = async (country: string) => {
    setLoadingCountry(country)
    onCountrySelect(country)

    // Clear loading state after a short delay to allow navigation
    timeoutRef.current = setTimeout(() => {
      setLoadingCountry(null)
    }, 1000)
  }

  const isCountryActive = (country: string) => {
    return searchField === 'name' && searchTerm === country
  }

  const isCountryLoading = (country: string) => {
    return loadingCountry === country
  }

  const WrapperClasses = isMobile
    ? 'border-t border-gray-100 bg-white lg:hidden'
    : 'border-t border-gray-100 bg-white hidden lg:block'

  const labelSize = isMobile ? 'text-sm' : 'text-[15px]'

  return (
    <div className={WrapperClasses}>
      <div className="container mx-auto px-4 py-1.5">
        <ScrollArea className="w-full" type="scroll">
          <nav className="relative flex justify-center gap-4 sm:gap-6">
            {countries.map((country) => {
              const isActive = isCountryActive(country)
              const isLoading = isCountryLoading(country)
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => handleCountryClick(country)}
                  className={`group relative flex-shrink-0 px-1 ${labelSize} whitespace-nowrap transition-colors ${
                    isLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer'
                  } ${isActive ? 'text-[#b01c14] font-semibold' : 'text-gray-600 hover:text-[#b01c14]'} `}
                >
                  <span className="inline-block pb-2">{country}</span>
                  <span
                    className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-full bg-[#b01c14]'
                        : 'w-0 bg-transparent group-hover:w-full group-hover:bg-gray-300'
                    }`}
                  />
                  {isLoading && (
                    <BiLoaderAlt className="absolute -top-1 -right-3 h-3 w-3 animate-spin text-[#b01c14]" />
                  )}
                </button>
              )
            })}
          </nav>
        </ScrollArea>
      </div>
    </div>
  )
}

export default CountryTabs
