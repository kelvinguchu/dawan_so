'use client'

import React from 'react'
import { SearchInput } from '@/components/common/SearchInput'

interface MobileSearchProps {
  searchOpen: boolean
}

const MobileSearch: React.FC<MobileSearchProps> = ({ searchOpen }) => {
  if (!searchOpen) {
    return null
  }

  return (
    <div className="py-2 border-t border-gray-100 lg:hidden">
      <div className="container mx-auto px-4">
        <SearchInput
          isHeaderSearch={true}
          inputClassName="h-10 rounded-full text-sm border-gray-200 focus-visible:ring-[#b01c14]"
          buttonClassName="h-10 px-4"
          redirectPath="/news"
          autoFocus={true}
          placeholder="Raadi maqaallo..."
        />
      </div>
    </div>
  )
}

export default MobileSearch
