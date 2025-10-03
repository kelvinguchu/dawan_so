interface ImageStructuredDataProps {
  image: {
    filename?: string | null
    alt?: string | null
    caption?: string | null
    width?: number | null
    height?: number | null
    createdAt?: string
    updatedAt?: string
  }
  pageUrl: string
  siteName?: string
}

export default function ImageStructuredData({
  image,
  pageUrl,
  siteName = 'Dawan TV'
}: ImageStructuredDataProps) {
  if (!image.filename) {
    return null
  }

  const imageUrl = `https://dawan.so/api/media/file/${image.filename}`

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": imageUrl,
    "url": pageUrl,
    "name": image.alt || image.caption || image.filename || 'Image',
    "description": image.caption || image.alt || `Image from ${siteName}`,
    "width": image.width,
    "height": image.height,
    "datePublished": image.createdAt,
    "dateModified": image.updatedAt,
    "author": {
      "@type": "Organization",
      "name": siteName
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": "https://dawan.so/logo.png"
      }
    },
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "acquireLicensePage": "https://dawan.so/about"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}