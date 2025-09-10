import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { BlogCategory } from '@/payload-types'
import Header from './Header'

const fetchCategories = async (): Promise<BlogCategory[]> => {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'blogCategories',
      limit: 50, 
      sort: 'name',
    })

    return result.docs || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

const HeaderServer: React.FC = async () => {
  const categories = await fetchCategories()

  return <Header initialCategories={categories} />
}

export default HeaderServer
