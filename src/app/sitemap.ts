import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import siteConfig from '@/app/shared-metadata'

const countries = ['Somalia', 'Kenya', 'Djibouti', 'Ethiopia', 'Eritrea']

async function getAllPosts() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'blogPosts',
    limit: 5000,
    depth: 2,
  })
  return posts.docs
}

async function getAllCategories() {
  const payload = await getPayload({ config })
  try {
    const categories = await payload.find({
      collection: 'blogCategories',
      limit: 100,
    })
    return categories.docs
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  const mainPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blockchain`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]

  const countryPages = countries.map((country) => ({
    url: `${baseUrl}/news?search=${encodeURIComponent(country)}&amp;searchField=name`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }))

  const posts = await getAllPosts()
  const postPages = posts.map((post) => {
    const postEntry: MetadataRoute.Sitemap[0] = {
      url: `${baseUrl}/news/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }

    if (post.layout) {
      const imageBlock = post.layout.find(
        (block) => block.blockType === 'cover' || block.blockType === 'image',
      )
      if (imageBlock && imageBlock.image && typeof imageBlock.image === 'object' && 'url' in imageBlock.image) {
        postEntry.images = [(imageBlock.image as { url: string }).url];      }
    }

    return postEntry
  })

  const categories = await getAllCategories()
  const filteredCategories = categories.filter(
    (category) => category.name.toLowerCase() !== 'blockchain' && category.slug !== 'blockchain',
  )
  const categoryPages = filteredCategories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const additionalPages = [
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  return [...mainPages, ...countryPages, ...postPages, ...categoryPages, ...additionalPages]
}
