import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { BlogPost } from '@/payload-types'
import { NewsCard } from './NewsCard'

interface BlockchainNewsListProps {
  limit?: number
}

const fetchBlockchainPosts = async (limit: number = 8) => {
  try {
    const payload = await getPayload({ config: configPromise })

    // First, get the blockchain category
    const categoryResult = await payload.find({
      collection: 'blogCategories',
      where: {
        slug: { equals: 'blockchain' },
      },
      limit: 1,
    })

    if (!categoryResult.docs || categoryResult.docs.length === 0) {
      console.log('No blockchain category found')
      return []
    }

    const blockchainCategoryId = categoryResult.docs[0].id

    // Then, get posts in that category
    const result = await payload.find({
      collection: 'blogPosts',
      where: {
        and: [
          {
            status: { equals: 'published' },
          },
          {
            categories: {
              in: [blockchainCategoryId],
            },
          },
        ],
      },
      limit,
      sort: '-createdAt',
      depth: 1,
    })

    return result.docs || []
  } catch (error) {
    console.error('Error fetching blockchain posts:', error)
    return []
  }
}

export const BlockchainNewsList: React.FC<BlockchainNewsListProps> = async ({ limit = 8 }) => {
  const posts: BlogPost[] = await fetchBlockchainPosts(limit)

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Wararkii Ugu Dambeeyay ee Blockchain
          </h2>
          <p className="text-gray-600">
            La soco horumarrada iyo aragtiyaha ugu dambeeyay ee blockchain
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {posts.map((post) => (
              <NewsCard key={post.id} post={post} showCategories={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Maqaallo blockchain ah weli lama helin.</p>
            <p className="text-sm text-gray-400 mt-2">
              Fadlan dib u eeg goor dambe si aad u aragto wararkii iyo aragtiyihii ugu dambeeyay.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
