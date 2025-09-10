import React from 'react'
import Link from 'next/link'
import { BiChevronRight } from 'react-icons/bi'
import { getFooterData } from '@/lib/footer-utils'

export async function FooterCategories() {
  const { categories } = await getFooterData()

  return (
    <div className="hidden sm:block sm:col-span-1 lg:col-span-2">
      <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white relative pb-2 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-10 sm:before:w-12 before:h-0.5 before:bg-[#b01c14]">
        Qaybaha
      </h4>
      <ul className="space-y-1.5 sm:space-y-2 text-sm">
        {[
          ...categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/categories/${category.slug}`}
                className="text-slate-300 hover:text-[#b01c14] transition-colors flex items-center"
              >
                <BiChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                {category.name}
              </Link>
            </li>
          )),
          <li key="blockchain-custom">
            <Link
              href="/blockchain"
              className="text-slate-300 hover:text-[#b01c14] transition-colors flex items-center"
            >
              <BiChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
              Blockchain
            </Link>
          </li>,
        ]}
      </ul>
    </div>
  )
}
